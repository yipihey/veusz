"""data.inspect_file — HDF5 + FITS introspection, then round-trip import."""

import numpy as np
import pytest

h5py = pytest.importorskip('h5py')
fits = pytest.importorskip('astropy.io.fits')


@pytest.fixture
def hdf5_path(tmp_path):
    p = tmp_path / 'sample.h5'
    with h5py.File(p, 'w') as f:
        f.create_dataset('alpha', data=np.arange(10.0))
        g = f.create_group('grp')
        g.create_dataset('beta', data=np.arange(5.0) * 2)
    return str(p)


@pytest.fixture
def fits_path(tmp_path):
    p = tmp_path / 'sample.fits'
    col = fits.Column(name='FLUX', format='E', array=np.arange(6.0))
    hdu = fits.BinTableHDU.from_columns([col], name='DATA')
    fits.HDUList([fits.PrimaryHDU(), hdu]).writeto(p)
    return str(p)


@pytest.mark.asyncio
async def test_inspect_hdf5_lists_datasets(daemon, hdf5_path):
    r = await daemon.call('data.inspect_file', kind='hdf5', filename=hdf5_path)
    assert r['available'] is True
    paths = {it['path'] for it in r['items']}
    assert '/alpha' in paths and '/grp/beta' in paths


@pytest.mark.asyncio
async def test_inspect_then_import_hdf5(daemon, hdf5_path):
    r = await daemon.call('data.inspect_file', kind='hdf5', filename=hdf5_path)
    items = [it['path'] for it in r['items']]
    imp = await daemon.call('data.import', kind='hdf5',
                            filename=hdf5_path, options={'items': items})
    assert imp['imported']  # at least one dataset materialised
    stats = await daemon.call('data.stats', name=imp['imported'][0])
    assert stats['len'] > 0


@pytest.mark.asyncio
async def test_inspect_fits_lists_columns(daemon, fits_path):
    r = await daemon.call('data.inspect_file', kind='fits', filename=fits_path)
    assert r['available'] is True
    paths = {it['path'] for it in r['items']}
    assert any(p.endswith('/flux') for p in paths)


@pytest.mark.asyncio
async def test_inspect_then_import_fits(daemon, fits_path):
    r = await daemon.call('data.inspect_file', kind='fits', filename=fits_path)
    items = [it['path'] for it in r['items'] if it['kind'] == 'column']
    imp = await daemon.call('data.import', kind='fits',
                            filename=fits_path, options={'items': items})
    assert imp['imported']


@pytest.mark.asyncio
async def test_inspect_unknown_kind_degrades(daemon):
    r = await daemon.call('data.inspect_file', kind='csv', filename='/x.csv')
    assert r['available'] is False and r['items'] == []
