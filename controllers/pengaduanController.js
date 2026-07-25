const db = require('../config/db');

// POST: Warga mengirim pengaduan (Publik)
exports.create = async (req, res) => {
  const { nama_pengirim, kontak, isi_pengaduan } = req.body;
  
  if (!nama_pengirim || !isi_pengaduan) {
    return res.status(400).json({ error: 'Nama pengirim dan isi pengaduan wajib diisi.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO pengaduan (nama_pengirim, kontak, isi_pengaduan) VALUES ($1, $2, $3) RETURNING *',
      [nama_pengirim, kontak, isi_pengaduan]
    );
    res.status(201).json({ 
      message: 'Pengaduan berhasil dikirim', 
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error create pengaduan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// GET: Melihat semua pengaduan (Admin Only)
exports.getAll = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM pengaduan ORDER BY tanggal_kirim DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error get pengaduan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT: Mengubah status pengaduan (Admin Only)
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // pending, proses, selesai

  try {
    const result = await db.query(
      'UPDATE pengaduan SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pengaduan tidak ditemukan' });
    }
    res.json({
      message: 'Status pengaduan diperbarui',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error update pengaduan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// DELETE: Menghapus pengaduan (Admin Only)
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM pengaduan WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pengaduan tidak ditemukan' });
    }
    res.json({ message: 'Pengaduan berhasil dihapus' });
  } catch (error) {
    console.error('Error delete pengaduan:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
