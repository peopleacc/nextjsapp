export default function handler(req, res) {
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
    }
  ];

  res.status(200).json(data);
}
