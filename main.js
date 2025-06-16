// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCfqZD7UZZt-GWmtNhfJyksrv3-8ENRjto",
  authDomain: "insan-cemerlang-d5574.firebaseapp.com",
  projectId: "insan-cemerlang-d5574",
  storageBucket: "insan-cemerlang-d5574.appspot.com",
  messagingSenderId: "1035937160050",
  appId: "1:1035937160050:web:6d77d3874c3f78b2811beb",
  measurementId: "G-EVVQ80Q08C"
};


// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const absensiRef = database.ref('absensi');

// DOM Elements
const absensiForm = document.getElementById('absensiForm');
const absensiTableBody = document.getElementById('absensiTableBody');
const btnReset = document.getElementById('btnReset');
const confirmDeleteModal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
let absensiIdToDelete = null;
let editMode = false;

// Event Listeners
absensiForm.addEventListener('submit', handleFormSubmit);
btnReset.addEventListener('click', resetForm);

// Fungsi untuk menangani submit form
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Ambil nilai dari form
    const tanggal = document.getElementById('tanggal').value;
    const nama = document.getElementById('nama').value;
    const nis = document.getElementById('nis').value;
    const kelas = document.getElementById('kelas').value;
    const alamat = document.getElementById('alamat').value;
    const noTelpon = document.getElementById('noTelpon').value;
    const keterangan = document.getElementById('keterangan').value;
    
    // Buat objek absensi
    const absensi = {
        tanggal,
        nama,
        nis,
        kelas,
        alamat,
        noTelpon,
        keterangan,
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Cek mode edit atau tambah baru
    const absensiId = document.getElementById('absensiId').value;
    if (editMode && absensiId) {
        // Update data yang ada
        database.ref(`absensi/${absensiId}`).update(absensi)
            .then(() => {
                showAlert('Data absensi berhasil diperbarui!', 'success');
                resetForm();
            })
            .catch(error => {
                showAlert('Gagal memperbarui data: ' + error.message, 'danger');
            });
    } else {
        // Tambah data baru
        absensiRef.push(absensi)
            .then(() => {
                showAlert('Data absensi berhasil ditambahkan!', 'success');
                resetForm();
            })
            .catch(error => {
                showAlert('Gagal menambahkan data: ' + error.message, 'danger');
            });
    }
}

// Fungsi untuk menampilkan data absensi
function renderAbsensiTable() {
    absensiRef.on('value', (snapshot) => {
        absensiTableBody.innerHTML = '';
        let no = 1;
        
        snapshot.forEach((childSnapshot) => {
            const absensi = childSnapshot.val();
            const absensiId = childSnapshot.key;
            
            // Format tanggal
            const formattedDate = new Date(absensi.tanggal).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Tentukan class untuk keterangan
            let keteranganClass = '';
            switch(absensi.keterangan) {
                case 'Hadir': keteranganClass = 'status-hadir'; break;
                case 'Tidak Hadir': keteranganClass = 'status-tidak-hadir'; break;
                case 'Sakit': keteranganClass = 'status-sakit'; break;
                case 'Izin': keteranganClass = 'status-izin'; break;
            }
            
            // Buat baris tabel
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${no++}</td>
                <td>${formattedDate}</td>
                <td>${absensi.nama}</td>
                <td>${absensi.nis}</td>
                <td>${absensi.kelas}</td>
                <td class="${keteranganClass}">${absensi.keterangan}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1 edit-btn" data-id="${absensiId}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${absensiId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            absensiTableBody.appendChild(row);
        });
        
        // Tambahkan event listener untuk tombol edit dan hapus
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editAbsensi(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                absensiIdToDelete = btn.dataset.id;
                confirmDeleteModal.show();
            });
        });
    });
}

// Fungsi untuk mengedit data absensi
function editAbsensi(id) {
    database.ref(`absensi/${id}`).once('value')
        .then((snapshot) => {
            const absensi = snapshot.val();
            
            // Isi form dengan data yang akan diedit
            document.getElementById('absensiId').value = id;
            document.getElementById('tanggal').value = absensi.tanggal;
            document.getElementById('nama').value = absensi.nama;
            document.getElementById('nis').value = absensi.nis;
            document.getElementById('kelas').value = absensi.kelas;
            document.getElementById('alamat').value = absensi.alamat;
            document.getElementById('noTelpon').value = absensi.noTelpon;
            document.getElementById('keterangan').value = absensi.keterangan;
            
            // Ubah mode ke edit
            editMode = true;
            document.getElementById('btnSubmit').innerHTML = '<i class="fas fa-save me-1"></i> Update';
            
            // Scroll ke form
            document.getElementById('absensiForm').scrollIntoView({ behavior: 'smooth' });
        })
        .catch(error => {
            showAlert('Gagal memuat data untuk diedit: ' + error.message, 'danger');
        });
}

// Fungsi untuk menghapus data absensi
document.getElementById('confirmDelete').addEventListener('click', () => {
    if (absensiIdToDelete) {
        database.ref(`absensi/${absensiIdToDelete}`).remove()
            .then(() => {
                showAlert('Data absensi berhasil dihapus!', 'success');
                confirmDeleteModal.hide();
            })
            .catch(error => {
                showAlert('Gagal menghapus data: ' + error.message, 'danger');
            });
    }
});

// Fungsi untuk mereset form
function resetForm() {
    absensiForm.reset();
    document.getElementById('absensiId').value = '';
    editMode = false;
    document.getElementById('btnSubmit').innerHTML = '<i class="fas fa-save me-1"></i> Simpan';
}

// Fungsi untuk menampilkan alert
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Hilangkan alert setelah 3 detik
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Set tanggal default ke hari ini
document.getElementById('tanggal').valueAsDate = new Date();

// Render tabel saat pertama kali load
document.addEventListener('DOMContentLoaded', renderAbsensiTable);