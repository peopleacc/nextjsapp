export async function GET() {
  const data = [
    {
      id: 1,
      name: "Taman Kota",
      phone: "081234567890",
      address: {
        street: "Jl. Merdeka No.1",
        city: "Jakarta",
        geo: {
          lat: "-6.200000",
          lng: "106.816666"
        }
      }
    },
    {
      id: 2,
      name: "Perpustakaan Umum",
      phone: "081987654321",
      address: {
        street: "Jl. Sudirman No.8",
        city: "Bandung",
        geo: {
          lat: "-6.914744",
          lng: "107.609810"
        }
      }
    },
    {
      id: 3,
      name: "Rumah Sakit Sehat Sentosa",
      phone: "082112223334",
      address: {
        street: "Jl. Diponegoro No.5",
        city: "Surabaya",
        geo: {
          lat: "-7.250445",
          lng: "112.768845"
        }
      }
    },
    {
      id: 4,
      name: "Pusat Kebugaran Nasional",
      phone: "081355667788",
      address: {
        street: "Jl. Adi Sucipto No.21",
        city: "Yogyakarta",
        geo: {
          lat: "-7.795580",
          lng: "110.369490"
        }
      }
    },
    {
      id: 5,
      name: "Museum Budaya Nusantara",
      phone: "081400200300",
      address: {
        street: "Jl. Gajah Mada No.12",
        city: "Semarang",
        geo: {
          lat: "-6.966667",
          lng: "110.416664"
        }
      }
    },
    {
      id: 6,
      name: "Lapangan Serbaguna",
      phone: "082122223333",
      address: {
        street: "Jl. Pahlawan No.9",
        city: "Medan",
        geo: {
          lat: "3.595196",
          lng: "98.672226"
        }
      }
    },
    {
      id: 7,
      name: "Taman Bunga Serayu",
      phone: "085355566677",
      address: {
        street: "Jl. Veteran No.3",
        city: "Banjarmasin",
        geo: {
          lat: "-3.318606",
          lng: "114.592445"
        }
      }
    }
  ];

  return Response.json(data);
}

