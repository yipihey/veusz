#    Copyright (C) 2026 Tom Abel & Veusz contributors.
#
#    This file is part of Veusz.
#
#    Veusz is free software: you can redistribute it and/or modify it
#    under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 2 of the License, or
#    (at your option) any later version.
##############################################################################

"""URL-linked data source — `LinkedFileURL` / `ImportFileURL`.

Parallels :mod:`veusz.dataimport.defn_csv` and friends: fetches bytes from an
HTTP(S) URL via :mod:`veusz.dataimport.url_fetch`, writes them to a temp file,
and delegates to the matching per-format import op (`OperationDataImportCSV`,
`...FITS`, …). The URL serves as the canonical "filename" in
`LinkedFileBase` machinery, which only ever uses the value as an opaque key
for `getLinkedFiles({...})` lookups and display, so no per-class casing is
needed elsewhere in the codebase.

On HTTP 304 (Not Modified) the reload is a no-op that preserves existing
datasets in place — :meth:`LinkedFileURL.reloadLinks` overrides the base to
skip the delete-and-move dance.
"""

import os
import tempfile
import urllib.parse

from .. import qtall as qt
from .. import document
from . import base
from . import url_fetch


def _(text, disambiguation=None, context='Import_URL'):
    return qt.QCoreApplication.translate(context, text, disambiguation)


# Inner-format dispatch. Each entry maps a `format` string to
# (tempfile suffix, module name, ImportParams* class name, OperationDataImport* class name).
# Modules are loaded lazily so e.g. h5py / astropy stay off the cold path.
_FORMATS = {
    'csv':   ('.csv',  'defn_csv',      'ImportParamsCSV',     'OperationDataImportCSV'),
    'fits':  ('.fits', 'defn_fits',     'ImportParamsFITS',    'OperationDataImportFITS'),
    'hdf5':  ('.h5',   'defn_hdf5',     'ImportParamsHDF5',    'OperationDataImportHDF5'),
    '2d':    ('.dat',  'defn_twod',     'ImportParams2D',      'OperationDataImport2D'),
    'nd':    ('.dat',  'defn_nd',       'ImportParamsND',      'OperationDataImportND'),
    'plain': ('.dat',  'defn_standard', 'ImportParamsSimple',  'OperationDataImport'),
}

_CONTENT_TYPE_FORMAT = {
    'text/csv':                     'csv',
    'text/tab-separated-values':    'csv',
    'application/csv':              'csv',
    'application/fits':             'fits',
    'image/fits':                   'fits',
    'application/x-hdf5':           'hdf5',
    'application/x-hdf':            'hdf5',
}

_EXT_FORMAT = {
    '.csv':  'csv', '.tsv':  'csv',
    '.fits': 'fits', '.fit': 'fits',
    '.h5':   'hdf5', '.hdf5': 'hdf5', '.hdf': 'hdf5',
}


def _infer_format(url, content_type):
    """Best-effort format inference: Content-Type wins, then URL extension."""
    if content_type:
        ct = content_type.split(';', 1)[0].strip().lower()
        if ct in _CONTENT_TYPE_FORMAT:
            return _CONTENT_TYPE_FORMAT[ct]
    path = urllib.parse.urlparse(url).path.lower()
    for ext, fmt in _EXT_FORMAT.items():
        if path.endswith(ext):
            return fmt
    return None


class ImportParamsURL(base.ImportParamsBase):
    """Parameters for `ImportFileURL`.

    Additional fields:
     url:           the canonical URL (mirrored to `filename` so existing
                    `LinkedFileBase`/`getLinkedFiles({filename})` machinery
                    just works without per-class casing).
     format:        '' to infer from Content-Type or URL extension, else
                    one of 'csv'|'fits'|'hdf5'|'2d'|'nd'|'plain'.
     format_params: dict of kwargs forwarded to the inner format's
                    `ImportParams*` (unknown keys are dropped).
     poll_seconds:  hint for embeds — auto-refetch interval. 0 = no polling.
    """

    defaults = {
        'url':           '',
        'format':        '',
        'format_params': None,
        'poll_seconds':  0,
    }
    defaults.update(base.ImportParamsBase.defaults)

    def __init__(self, **argsv):
        base.ImportParamsBase.__init__(self, **argsv)
        # Mirror url <-> filename so LinkedFileBase.filename + getLinkedFiles
        # comparisons work without a special case.
        if self.url and not self.filename:
            self.filename = self.url
        elif self.filename and not self.url:
            self.url = self.filename
        if self.format and self.format not in _FORMATS:
            raise ValueError(f'invalid format: {self.format!r}')


class OperationDataImportURL(base.OperationDataImportBase):
    """Fetch bytes from `params.url`, delegate to the per-format import op."""

    descr = _('import data from URL')

    def doImport(self):
        p = self.params
        # Tracked by LinkedFileURL.reloadLinks to skip the delete/move dance
        # on a 304 (Not Modified) reload — datasets stay in place.
        self.not_modified = False
        fr = url_fetch.fetch_url(p.url)
        if fr.not_modified:
            self.not_modified = True
            return

        fmt = p.format or _infer_format(p.url, fr.content_type) or 'plain'
        suffix, mod_name, params_name, op_name = _FORMATS[fmt]
        mod = __import__(
            f'veusz.dataimport.{mod_name}',
            fromlist=[params_name, op_name])
        ParamsClass = getattr(mod, params_name)
        OpClass = getattr(mod, op_name)

        # Build inner params: format_params wins; layer base fields the inner
        # class accepts. Filename and `linked` are set below.
        inner_defaults = ParamsClass.defaults
        inner_kw = {}
        if p.format_params:
            for k, v in p.format_params.items():
                if k in inner_defaults:
                    inner_kw[k] = v
        for k in ('encoding', 'prefix', 'suffix', 'tags', 'renames'):
            if k in inner_defaults and k not in inner_kw:
                v = getattr(p, k)
                if v is not None:
                    inner_kw[k] = v
        inner_kw['linked'] = False  # we manage the link ourselves

        # Write the fetched body to a temp file the inner importer can open.
        tf = tempfile.NamedTemporaryFile(suffix=suffix, delete=False)
        tf_name = tf.name
        try:
            tf.write(fr.body)
            tf.close()
            inner_kw['filename'] = tf_name
            inner_params = ParamsClass(**inner_kw)
            inner_op = OpClass(inner_params)
            # We call doImport() directly (not via the parent's do()), so set
            # up the bookkeeping fields the inner op expects.
            inner_op.outnames = []
            inner_op.outdatasets = {}
            inner_op.outcustoms = []
            inner_op.outinvalids = {}
            inner_op.doImport()
            self.outdatasets.update(inner_op.outdatasets)
            self.outinvalids.update(inner_op.outinvalids)
            if getattr(inner_op, 'outcustoms', None):
                self.outcustoms.extend(inner_op.outcustoms)
        finally:
            try:
                os.unlink(tf_name)
            except OSError:
                pass

        # Re-link harvested datasets to OUR LinkedFileURL so reloads route
        # back through us, not through the inner CSV/FITS/etc. linked file.
        if p.linked:
            link = LinkedFileURL(p)
            for ds in self.outdatasets.values():
                ds.linked = link


class LinkedFileURL(base.LinkedFileBase):
    """A URL-linked data source that re-imports on reload."""

    def createOperation(self):
        return OperationDataImportURL

    def saveToFile(self, fileobj, relpath=None):
        # URLs are absolute by definition — pass relpath=None so the helper
        # doesn't run `utils.relpath` on an `http://...` string.
        self._saveHelper(
            fileobj, 'ImportFileURL', ('filename',),
            renameparams={'prefix': 'dsprefix', 'suffix': 'dssuffix'})

    def _getSaveFilename(self, relpath):
        """Override base — never relativize or path-mangle URLs."""
        return self.params.url or self.params.filename

    def reloadLinks(self, document):
        """Like `LinkedFileBase.reloadLinks`, but on a 304 keep existing
        datasets in place instead of wiping them via `_deleteLinkedDatasets`."""
        op = OperationDataImportURL(self.params)
        tempdoc = document.__class__()
        try:
            tempdoc.applyOperation(op)
        except Exception as ex:
            document.log(str(ex))
            errors = {n: 1 for n, ds in document.data.items()
                      if ds.linked is self}
            return ([], errors)
        if getattr(op, 'not_modified', False):
            return ([], op.outinvalids)
        tags = self._deleteLinkedDatasets(document)
        read = self._moveReadDatasets(tempdoc, document, tags)
        return (read, op.outinvalids)


def ImportFileURL(comm, url,
                  format='', format_params=None, poll_seconds=0,
                  encoding='utf_8', dsprefix='', dssuffix='',
                  prefix=None, renames=None, tags=None,
                  linked=True):
    """Read data from a URL.

    url           HTTP(S) URL of the data.
    format        '' (default): infer from response Content-Type or URL
                  extension. Else one of 'csv'|'fits'|'hdf5'|'2d'|'nd'|'plain'.
    format_params dict of kwargs forwarded to the inner format's import
                  params (e.g. `{'delimiter': '\\t'}` for CSV).
    poll_seconds  hint for the browser embed — auto-refetch interval in
                  seconds. 0 = no polling. Ignored on desktop (use a script
                  or the Reload Data dialog).
    encoding      text encoding (CSV / plain only).
    dsprefix /
    dssuffix      prepended / appended to imported dataset names.
    renames       map of old -> new dataset name.
    tags          list of tags applied to imported datasets.
    linked        True (default): re-imports follow the URL on reload, and
                  saving the .vsz preserves this `ImportFileURL(...)` call.

    Returns: list of imported dataset names.
    """
    if prefix:
        dsprefix = prefix + '_'
    # NOTE: do NOT call comm.findFileOnImportPath — that walks the
    # importpath looking for a local file and would resolve a relative URL
    # like 'data.csv' to a path that happens to exist on disk, then our
    # cache lookup (keyed by the URL string we were called with) misses.
    # URLs are URLs; relative resolution happens elsewhere (embed: JS-side
    # urlBase; desktop: future enhancement, against the .vsz file://).
    params = ImportParamsURL(
        url=url, filename=url, format=format,
        format_params=format_params, poll_seconds=poll_seconds,
        prefix=dsprefix, suffix=dssuffix, encoding=encoding,
        renames=renames, tags=tags, linked=linked)
    op = OperationDataImportURL(params)
    comm.document.applyOperation(op)
    if comm.verbose:
        print('Imported datasets %s' % ' '.join(op.outnames))
    return op.outnames


document.registerImportCommand('ImportFileURL', ImportFileURL)
