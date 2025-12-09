export async function GET() {
    const data = [
        {
            id: 1,
            name: "Universitas Diponegoro",
            phone: "081234567890",
            address: {
                street: "Jl. Prof. Soedarto, Tembalang, Kec. Tembalang, Kota Semarang, Jawa Tengah 50275",
                city: "Semarang",
                geo: {
                    lat: "-7.051813425482647",
                    lng: "110.44095596829803"
                }
            }
        },
        {
            id: 2,
            name: "Institute Teknologi Indonesia",
            phone: "081987654321",
            address: {
                street: "Jl. Tamansari No.73, Lb. Siliwangi, Kecamatan Coblong, Kota Bandung, Jawa Barat 40132",
                city: "Bandung",
                geo: {
                    lat: "-6.88595748927564",
                    lng: "107.60843962814887"
                }
            }
        },
        {
            id: 3,
            name: "Universitas Negeri indonesia",
            phone: "082112223334",
            address: {
                street: "Jl. Lingkar, Pondok Cina, Kecamatan Beji, Kota Depok, Jawa Barat 16424",
                city: "Depok",
                geo: {
                    lat: "-6.360526928489944",
                    lng: "106.82723429553113"
                }
            }
        },
        {
            id: 4,
            name: "Universitas Padjajaran",
            phone: "081355667788",
            address: {
                street: "Jl. Raya Bandung Sumedang KM.21, Hegarmanah, Kec. Jatinangor, Kabupaten Sumedang, Jawa Barat 45363",
                city: "Yogyakarta",
                geo: {
                    lat: "-6.9134344601077355",
                    lng: "107.77491462121623"
                }
            }
        },
        {
            id: 5,
            name: "Universitas Gadjah Mada",
            phone: "081400200300",
            address: {
                street: "Jl. Gajah Mada No.12",
                city: "Semarang",
                geo: {
                    lat: "-7.7706903072523765",
                    lng: "110.37786929529192"
                }
            }
        }

    ];

    return Response.json(data);
}

