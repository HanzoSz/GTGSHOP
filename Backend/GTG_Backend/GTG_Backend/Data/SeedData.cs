using GTG_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Data
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            if (context.Products.Any()) return;

            // 1. Seed Roles
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Role { RoleName = "Admin" },
                    new Role { RoleName = "Customer" }
                );
                context.SaveChanges();
            }

            // 2. Seed Categories (11 danh mục)
            var cats = new[] { "CPU - Bộ vi xử lý", "VGA - Card đồ họa", "Mainboard", "RAM", "SSD / HDD", "Case PC", "Nguồn PSU", "Tản nhiệt", "Chuột", "Bàn phím", "Màn hình" };
            foreach (var c in cats) context.Categories.Add(new Category { Name = c });
            context.SaveChanges();

            // Helper
            void P(string name, decimal price, int stock, int catId, int discount, double rating, int reviews, string? desc, string? img, string? specs)
            {
                context.Products.Add(new Product { Name = name, Price = price, Stock = stock, CategoryId = catId, Discount = discount, Rating = rating, Reviews = reviews, Description = desc, ImageUrl = img, TechSpecs = specs });
            }

            // ===== CPU (catId=1) =====
            P("Intel Core i9-14900K", 12599000, 20, 1, 0, 5.0, 0, "Vi xử lý Intel thế hệ 14, 24 nhân 32 luồng, xung nhịp tối đa 6.0GHz.", "images/products/cpu.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 253}");
            P("AMD Ryzen 9 7950X", 13999000, 15, 1, 5, 5.0, 0, "CPU AMD Zen 4, 16 nhân 32 luồng, hiệu năng đa luồng hàng đầu.", "images/products/ryzen9.jpg", "{\"Socket\": \"AM5\", \"SupportedRams\": [\"DDR5\"], \"TDP\": 170}");
            P("Intel Core i7-14700K", 9750000, 25, 1, 0, 5.0, 0, "20 nhân 28 luồng, xung tối đa 5.6GHz, hiệu năng gaming xuất sắc.", "images/products/i7-14700k.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 253}");
            P("AMD Ryzen 7 7800X3D", 9500000, 18, 1, 0, 5.0, 0, "CPU gaming tốt nhất với 3D V-Cache 96MB.", "images/products/7800x3d.jpg", "{\"Socket\": \"AM5\", \"SupportedRams\": [\"DDR5\"], \"TDP\": 120}");
            P("Intel Core i5-13400F", 4500000, 40, 1, 10, 5.0, 0, "10 nhân 16 luồng, giá tốt cho gaming 1080p.", "images/products/i5-13400f.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 148}");
            P("AMD Ryzen 5 7600X", 5200000, 35, 1, 0, 5.0, 0, "6 nhân 12 luồng Zen 4, tối ưu cho gaming.", "images/products/7600x.jpg", "{\"Socket\": \"AM5\", \"SupportedRams\": [\"DDR5\"], \"TDP\": 105}");
            P("Intel Core i3-12100F", 2250000, 50, 1, 0, 5.0, 0, "4 nhân 8 luồng, CPU budget gaming tốt nhất.", "images/products/i3-12100f.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 58}");
            P("AMD Ryzen 5 5600G", 3100000, 30, 1, 0, 5.0, 0, "APU tích hợp GPU Vega 7, lý tưởng cho PC không card rời.", "images/products/5600g.jpg", "{\"Socket\": \"AM4\", \"SupportedRams\": [\"DDR4\"], \"TDP\": 65}");
            P("Intel Core i9-13900KS", 15500000, 10, 1, 0, 5.0, 0, "Phiên bản đặc biệt xung nhịp 6.0GHz, 24 nhân.", "images/products/i9-13900ks.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 253}");
            P("AMD Ryzen 7 5700X", 4725000, 30, 1, 0, 5.0, 0, "8 nhân 16 luồng AM4, giá tốt cho nâng cấp.", "images/products/5700x.jpg", "{\"Socket\": \"AM4\", \"SupportedRams\": [\"DDR4\"], \"TDP\": 65}");
            P("Intel Core i7-12700K", 6500000, 20, 1, 0, 5.0, 0, "12 nhân 20 luồng, Alder Lake mạnh mẽ.", "images/products/i7-12700k.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 190}");
            P("AMD Ryzen 9 5900X", 5750000, 15, 1, 0, 5.0, 0, "12 nhân 24 luồng Zen 3, đa nhiệm xuất sắc.", "images/products/5900x.jpg", "{\"Socket\": \"AM4\", \"SupportedRams\": [\"DDR4\"], \"TDP\": 105}");
            P("Intel Core i3-13100", 3000000, 45, 1, 0, 5.0, 0, "4 nhân 8 luồng với iGPU UHD 730.", "images/products/i3-13100.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 60}");
            P("Intel Core i5-14600K", 7000000, 25, 1, 0, 5.0, 0, "14 nhân 20 luồng, gaming và đa nhiệm xuất sắc.", "images/products/i5-14600k.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 181}");
            P("Intel Core i3-12100", 2750000, 50, 1, 0, 0.0, 0, "4 nhân 8 luồng, CPU entry-level hiệu năng tốt.", "images/products/i3-12100.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 60}");
            P("Intel Core i5-12400", 3990000, 40, 1, 5, 0.0, 0, "6 nhân 12 luồng, lựa chọn phổ thông tuyệt vời.", "images/products/i5-12400.jpg", "{\"Socket\": \"LGA1700\", \"SupportedRams\": [\"DDR4\", \"DDR5\"], \"TDP\": 65}");
            P("AMD Ryzen 5 5600G", 3100000, 30, 1, 0, 0.0, 0, "APU với Vega 7 iGPU, hoàn hảo cho PC không VGA rời.", "images/products/ryzen5-5600g.jpg", "{\"Socket\": \"AM4\", \"SupportedRams\": [\"DDR4\"], \"TDP\": 65}");

            // ===== VGA (catId=2) =====
            P("ROG Strix RTX 4090", 45000000, 5, 2, 0, 5.0, 0, "Card đồ họa mạnh nhất, 24GB GDDR6X.", "images/products/rtx4090.jpg", "{\"Chipset\": \"RTX 4090\", \"VRAM\": \"24GB GDDR6X\", \"RecommendPSU\": 850, \"Length\": 358}");
            P("MSI RTX 4080 Super Gaming X", 28000000, 8, 2, 0, 5.0, 0, "16GB GDDR6X, hiệu năng 4K gaming.", "images/products/rtx4080s.jpg", "{\"Chipset\": \"RTX 4080 Super\", \"VRAM\": \"16GB GDDR6X\", \"RecommendPSU\": 750, \"Length\": 340}");
            P("Gigabyte RTX 4070 Ti Eagle", 18000000, 12, 2, 0, 5.0, 0, "12GB GDDR6X, chiến mượt 1440p.", "images/products/rtx4070ti.jpg", "{\"Chipset\": \"RTX 4070 Ti\", \"VRAM\": \"12GB GDDR6X\", \"RecommendPSU\": 700, \"Length\": 302}");
            P("ASUS Dual RTX 4060 Ti", 10500000, 20, 2, 0, 5.0, 0, "8GB GDDR6, gaming 1080p tuyệt vời.", "images/products/rtx4060ti.jpg", "{\"Chipset\": \"RTX 4060 Ti\", \"VRAM\": \"8GB GDDR6\", \"RecommendPSU\": 550, \"Length\": 267}");
            P("Zotac RTX 3060 12GB", 7000000, 25, 2, 10, 5.0, 0, "Card phổ thông 12GB, đủ sức eSport.", "images/products/rtx3060.jpg", "{\"Chipset\": \"RTX 3060\", \"VRAM\": \"12GB GDDR6\", \"RecommendPSU\": 550, \"Length\": 231}");
            P("Sapphire Pulse RX 7900 XTX", 25000000, 6, 2, 0, 5.0, 0, "24GB GDDR6, đối thủ RTX 4080.", "images/products/rx7900xtx.jpg", "{\"Chipset\": \"RX 7900 XTX\", \"VRAM\": \"24GB GDDR6\", \"RecommendPSU\": 800, \"Length\": 320}");
            P("ASUS TUF RX 7800 XT", 13000000, 15, 2, 0, 5.0, 0, "16GB GDDR6, gaming 1440p giá tốt.", "images/products/rx7800xt.jpg", "{\"Chipset\": \"RX 7800 XT\", \"VRAM\": \"16GB GDDR6\", \"RecommendPSU\": 700, \"Length\": 301}");
            P("Galax RTX 4070 Extreme", 15000000, 10, 2, 0, 5.0, 0, "12GB GDDR6X, cân bằng hiệu năng/giá.", "images/products/rtx4070.jpg", "{\"Chipset\": \"RTX 4070\", \"VRAM\": \"12GB GDDR6X\", \"RecommendPSU\": 650, \"Length\": 298}");
            P("Colorful RTX 3050 NB", 5000000, 30, 2, 15, 5.0, 0, "8GB GDDR6, entry gaming.", "images/products/rtx3050.jpg", "{\"Chipset\": \"RTX 3050\", \"VRAM\": \"8GB GDDR6\", \"RecommendPSU\": 450, \"Length\": 210}");
            P("Palit RTX 4060 Dual", 8000000, 18, 2, 0, 5.0, 0, "8GB GDDR6, compact và mát.", "images/products/rtx4060.jpg", "{\"Chipset\": \"RTX 4060\", \"VRAM\": \"8GB GDDR6\", \"RecommendPSU\": 550, \"Length\": 240}");
            P("MSI RX 6750 XT Mech", 9000000, 12, 2, 5, 5.0, 0, "12GB GDDR6, AMD mid-range.", "images/products/rx6750xt.jpg", "{\"Chipset\": \"RX 6750 XT\", \"VRAM\": \"12GB GDDR6\", \"RecommendPSU\": 650, \"Length\": 275}");
            P("MSI RTX 4060 Ti 8G Ventus 2X Black", 11500000, 15, 2, 0, 0.0, 0, "8GB GDDR6, thiết kế dual fan nhỏ gọn.", "images/products/rtx4060ti-ventus.jpg", "{\"Chipset\": \"RTX 4060 Ti\", \"VRAM\": \"8GB GDDR6\", \"RecommendPSU\": 550, \"Length\": 251}");
            P("NVIDIA GeForce RTX 5060", 12599000, 10, 2, 0, 0.0, 0, "8GB GDDR7, thế hệ Blackwell mới nhất.", "images/products/rtx5060.jpg", "{\"Chipset\": \"RTX 5060\", \"VRAM\": \"8GB GDDR7\", \"RecommendPSU\": 550, \"Length\": 241}");

            // ===== Mainboard (catId=3) =====
            P("ASUS ROG Z790-E Gaming", 8500000, 10, 3, 0, 5.0, 0, "Mainboard cao cấp LGA1700, DDR5, WiFi 6E.", "images/products/z790e.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR5\", \"FormFactor\": \"ATX\"}");
            P("MSI MAG B760M Mortar WIFI", 4500000, 20, 3, 0, 5.0, 0, "Micro-ATX LGA1700, DDR5, WiFi tích hợp.", "images/products/b760m.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR5\", \"FormFactor\": \"Micro-ATX\"}");
            P("Gigabyte Z790 AORUS ELITE", 7500000, 12, 3, 0, 5.0, 0, "ATX Z790, DDR5, PCIe 5.0.", "images/products/z790aorus.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR5\", \"FormFactor\": \"ATX\"}");
            P("ASROCK B660M Pro RS", 3000000, 25, 3, 5, 5.0, 0, "Budget LGA1700, DDR4, Micro-ATX.", "images/products/b660m.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR4\", \"FormFactor\": \"Micro-ATX\"}");
            P("ASUS TUF GAMING B550-PLUS", 3500000, 18, 3, 0, 5.0, 0, "AM4 ATX, DDR4, PCIe 4.0.", "images/products/b550plus.jpg", "{\"Socket\": \"AM4\", \"RamType\": \"DDR4\", \"FormFactor\": \"ATX\"}");
            P("MSI MPG X670E Carbon", 9000000, 8, 3, 0, 5.0, 0, "AM5 ATX cao cấp, DDR5, WiFi 6E.", "images/products/x670e.jpg", "{\"Socket\": \"AM5\", \"RamType\": \"DDR5\", \"FormFactor\": \"ATX\"}");
            P("Gigabyte B650M Gaming", 4000000, 15, 3, 0, 5.0, 0, "AM5 Micro-ATX, DDR5, giá tốt.", "images/products/b650m.jpg", "{\"Socket\": \"AM5\", \"RamType\": \"DDR5\", \"FormFactor\": \"Micro-ATX\"}");
            P("ASUS Prime H610M-K", 2000000, 30, 3, 10, 5.0, 0, "Budget LGA1700, DDR4, cơ bản.", "images/products/h610m.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR4\", \"FormFactor\": \"Micro-ATX\"}");
            P("MSI PRO Z690-A", 5500000, 12, 3, 0, 5.0, 0, "LGA1700 ATX, DDR5, tầm trung.", "images/products/z690a.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR5\", \"FormFactor\": \"ATX\"}");
            P("ASROCK Z790 Steel Legend", 6500000, 10, 3, 0, 5.0, 0, "LGA1700 ATX, DDR5, thiết kế độc đáo.", "images/products/z790steel.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR5\", \"FormFactor\": \"ATX\"}");
            P("ROG STRIX B760-I Gaming", 5000000, 8, 3, 0, 5.0, 0, "Mini-ITX LGA1700, DDR5, nhỏ gọn.", "images/products/b760i.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR5\", \"FormFactor\": \"Mini-ITX\"}");
            P("Mainboard ASUS PRIME H610M-K D4", 1790000, 30, 3, 0, 0.0, 0, "Budget DDR4, phù hợp PC văn phòng.", "images/products/h610m-d4.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR4\", \"FormFactor\": \"Micro-ATX\"}");
            P("Mainboard MSI PRO B760M-E DDR4", 2290000, 25, 3, 5, 0.0, 0, "Micro-ATX DDR4, tích hợp tốt.", "images/products/b760m-e.jpg", "{\"Socket\": \"LGA1700\", \"RamType\": \"DDR4\", \"FormFactor\": \"Micro-ATX\"}");
            P("Mainboard Gigabyte B550M DS3H", 2290000, 20, 3, 10, 0.0, 0, "AM4 Micro-ATX, DDR4, giá rẻ.", "images/products/b550m-ds3h.jpg", "{\"Socket\": \"AM4\", \"RamType\": \"DDR4\", \"FormFactor\": \"Micro-ATX\"}");

            // ===== RAM (catId=4) =====
            P("Corsair Vengeance RGB 32GB DDR5", 3200000, 20, 4, 0, 5.0, 0, "2x16GB DDR5-5600, RGB đẹp mắt.", "images/products/corsair-rgb.jpg", "{\"Type\": \"DDR5\", \"Capacity\": 32, \"Speed\": 5600}");
            P("G.Skill Trident Z5 Neo 16GB", 2000000, 25, 4, 0, 5.0, 0, "2x8GB DDR5-6000, tối ưu cho AMD.", "images/products/trident-z5.jpg", "{\"Type\": \"DDR5\", \"Capacity\": 16, \"Speed\": 6000}");
            P("Kingston FURY Beast 8GB DDR4", 600000, 50, 4, 0, 5.0, 0, "1x8GB DDR4-3200, entry-level.", "images/products/fury-beast.jpg", "{\"Type\": \"DDR4\", \"Capacity\": 8, \"Speed\": 3200}");
            P("TeamGroup T-Force Delta RGB 16GB", 1550000, 30, 4, 0, 5.0, 0, "2x8GB DDR4-3200, RGB rực rỡ.", "images/products/tforce-delta.jpg", "{\"Type\": \"DDR4\", \"Capacity\": 16, \"Speed\": 3200}");
            P("Adata XPG Spectrix D50", 1800000, 20, 4, 0, 5.0, 0, "2x8GB DDR4-3600, hiệu năng cao.", "images/products/xpg-d50.jpg", "{\"Type\": \"DDR4\", \"Capacity\": 16, \"Speed\": 3600}");
            P("Crucial Pro 32GB Kit DDR5", 2800000, 15, 4, 0, 5.0, 0, "2x16GB DDR5-5600, ổn định.", "images/products/crucial-pro.jpg", "{\"Type\": \"DDR5\", \"Capacity\": 32, \"Speed\": 5600}");
            P("Lexar Thor OC 32GB", 2550000, 12, 4, 0, 5.0, 0, "2x16GB DDR5-6400, OC tốt.", "images/products/lexar-thor.jpg", "{\"Type\": \"DDR5\", \"Capacity\": 32, \"Speed\": 6400}");
            P("Corsair Dominator Platinum 64GB", 5500000, 8, 4, 0, 5.0, 0, "2x32GB DDR5-5600, cao cấp.", "images/products/dominator.jpg", "{\"Type\": \"DDR5\", \"Capacity\": 64, \"Speed\": 5600}");
            P("G.Skill Ripjaws V 16GB", 1200000, 35, 4, 5, 5.0, 0, "2x8GB DDR4-3200, giá tốt.", "images/products/ripjaws.jpg", "{\"Type\": \"DDR4\", \"Capacity\": 16, \"Speed\": 3200}");
            P("RAM Kingston Fury Beast 8GB DDR4 3200MHz", 450000, 100, 4, 0, 0.0, 0, "1x8GB DDR4-3200, cơ bản.", "images/products/fury-8gb.jpg", "{\"Type\": \"DDR4\", \"Capacity\": 8, \"Speed\": 3200}");
            P("RAM Corsair Vengeance LPX 16GB DDR4 3200MHz", 1090000, 80, 4, 5, 0.0, 0, "2x8GB DDR4, phổ thông.", "images/products/lpx-16gb.jpg", "{\"Type\": \"DDR4\", \"Capacity\": 16, \"Speed\": 3200}");
            P("RAM G.Skill Ripjaws V 16GB DDR4 3200MHz", 950000, 60, 4, 0, 0.0, 0, "1x16GB DDR4, đơn kênh.", "images/products/ripjaws-16.jpg", "{\"Type\": \"DDR4\", \"Capacity\": 16, \"Speed\": 3200}");

            // ===== SSD/HDD (catId=5) =====
            P("Samsung 990 Pro 1TB M.2", 3200000, 20, 5, 0, 5.0, 0, "NVMe Gen4, tốc độ đọc 7450MB/s.", "images/products/990pro.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"1TB\", \"Gen\": \"PCIe 4.0\", \"ReadSpeed\": 7450}");
            P("WD Black SN850X 2TB", 5500000, 10, 5, 0, 5.0, 0, "NVMe Gen4, hiệu năng cao.", "images/products/sn850x.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"2TB\", \"Gen\": \"PCIe 4.0\", \"ReadSpeed\": 7300}");
            P("Crucial P5 Plus 500GB", 1500000, 25, 5, 0, 5.0, 0, "NVMe Gen4, giá tốt.", "images/products/p5plus.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"500GB\", \"Gen\": \"PCIe 4.0\", \"ReadSpeed\": 6600}");
            P("Kingston NV2 1TB NVMe", 1800000, 30, 5, 0, 5.0, 0, "NVMe Gen4, phổ thông.", "images/products/nv2.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"1TB\", \"Gen\": \"PCIe 4.0\", \"ReadSpeed\": 3500}");
            P("Samsung 870 EVO 500GB", 1500000, 20, 5, 0, 5.0, 0, "SATA SSD, đáng tin cậy.", "images/products/870evo.jpg", "{\"Type\": \"SSD SATA\", \"Capacity\": \"500GB\", \"Gen\": \"SATA III\", \"ReadSpeed\": 560}");
            P("WD Blue 4TB HDD", 2500000, 15, 5, 0, 5.0, 0, "HDD lưu trữ dung lượng lớn.", "images/products/wdblue.jpg", "{\"Type\": \"HDD\", \"Capacity\": \"4TB\", \"Gen\": \"SATA III\", \"ReadSpeed\": 175}");
            P("Seagate Barracuda 2TB", 1500000, 25, 5, 0, 5.0, 0, "HDD 7200rpm, lưu trữ cơ bản.", "images/products/barracuda.jpg", "{\"Type\": \"HDD\", \"Capacity\": \"2TB\", \"Gen\": \"SATA III\", \"ReadSpeed\": 190}");
            P("Lexar NM790 1TB", 2200000, 15, 5, 0, 5.0, 0, "NVMe Gen4, tốc độ tốt giá rẻ.", "images/products/nm790.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"1TB\", \"Gen\": \"PCIe 4.0\", \"ReadSpeed\": 7400}");
            P("Gigabyte AORUS Gen4 2TB", 4500000, 8, 5, 0, 5.0, 0, "NVMe Gen4, tản nhiệt tốt.", "images/products/aorus-ssd.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"2TB\", \"Gen\": \"PCIe 4.0\", \"ReadSpeed\": 7300}");
            P("Samsung 970 EVO Plus 1TB", 2800000, 18, 5, 0, 5.0, 0, "NVMe Gen3, ổn định đáng tin.", "images/products/970evo.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"1TB\", \"Gen\": \"PCIe 3.0\", \"ReadSpeed\": 3500}");
            P("SSD Kingston NV2 250GB PCIe Gen4x4 NVMe", 850000, 50, 5, 0, 0.0, 0, "SSD giá rẻ 250GB.", "images/products/nv2-250.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"250GB\", \"Gen\": \"PCIe 4.0\", \"ReadSpeed\": 3000}");
            P("SSD Samsung 980 500GB PCIe NVMe M.2 2280", 1290000, 40, 5, 5, 0.0, 0, "NVMe Gen3, Samsung đáng tin.", "images/products/980-500.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"500GB\", \"Gen\": \"PCIe 3.0\", \"ReadSpeed\": 3100}");
            P("SSD Western Digital Blue SN580 500GB NVMe", 1350000, 35, 5, 0, 0.0, 0, "NVMe Gen4 giá rẻ.", "images/products/sn580.jpg", "{\"Type\": \"SSD NVMe\", \"Capacity\": \"500GB\", \"Gen\": \"PCIe 4.0\", \"ReadSpeed\": 4150}");

            // ===== Case PC (catId=6) =====
            P("NZXT H9 Flow White", 4500000, 10, 6, 0, 5.0, 0, "Full Tower, kính cường lực 4 mặt.", "images/products/h9flow.jpg", "{\"SupportedMainboards\": [\"ATX\", \"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 370, \"MaxCoolerHeight\": 170}");
            P("Corsair 4000D Airflow", 2500000, 20, 6, 0, 5.0, 0, "Mid Tower, tối ưu luồng gió.", "images/products/4000d.jpg", "{\"SupportedMainboards\": [\"ATX\", \"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 360, \"MaxCoolerHeight\": 170}");
            P("Lian Li O11 Dynamic", 3500000, 12, 6, 0, 5.0, 0, "Dual chamber, huyền thoại watercooling.", "images/products/o11.jpg", "{\"SupportedMainboards\": [\"ATX\", \"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 420, \"MaxCoolerHeight\": 155}");
            P("Cooler Master MasterBox", 1500000, 25, 6, 0, 5.0, 0, "Mid Tower, giá tốt.", "images/products/masterbox.jpg", "{\"SupportedMainboards\": [\"ATX\", \"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 340, \"MaxCoolerHeight\": 165}");
            P("Xigmatek Aquarius Plus", 2750000, 15, 6, 0, 5.0, 0, "Mid Tower, thiết kế mesh.", "images/products/aquarius.jpg", "{\"SupportedMainboards\": [\"ATX\", \"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 380, \"MaxCoolerHeight\": 165}");
            P("Mik LV12 Mini Elite", 1200000, 20, 6, 5, 5.0, 0, "Micro-ATX, nhỏ gọn.", "images/products/lv12.jpg", "{\"SupportedMainboards\": [\"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 310, \"MaxCoolerHeight\": 155}");
            P("Sama 3301 Black", 900000, 30, 6, 0, 5.0, 0, "Mid Tower giá rẻ.", "images/products/sama3301.jpg", "{\"SupportedMainboards\": [\"ATX\", \"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 330, \"MaxCoolerHeight\": 160}");
            P("Vỏ Case Xigmatek XA-22 (ATX)", 350000, 50, 6, 0, 0.0, 0, "Case ATX giá siêu rẻ.", "images/products/xa22.jpg", "{\"SupportedMainboards\": [\"ATX\", \"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 350, \"MaxCoolerHeight\": 160}");
            P("Vỏ Case Kenoo Esport M100", 490000, 40, 6, 0, 0.0, 0, "Kính cường lực, gaming giá rẻ.", "images/products/m100.jpg", "{\"SupportedMainboards\": [\"ATX\", \"Micro-ATX\", \"Mini-ITX\"], \"MaxVGALength\": 340, \"MaxCoolerHeight\": 165}");
            P("Vỏ Case Mik LV12 Mini Flow", 890000, 25, 6, 0, 0.0, 0, "Mini Tower, tối ưu không gian.", "images/products/lv12-flow.jpg", "{\"SupportedMainboards\": [\"Mini-ITX\", \"Micro-ATX\"], \"MaxVGALength\": 320, \"MaxCoolerHeight\": 140}");

            // ===== Nguồn PSU (catId=7) =====
            P("Corsair RM1000e 80+ Gold", 3500000, 12, 7, 0, 5.0, 0, "1000W, full modular, 80+ Gold.", "images/products/rm1000e.jpg", "{\"Wattage\": 1000}");
            P("MSI MAG A850GL PCIE5", 2800000, 15, 7, 0, 5.0, 0, "850W, PCIe 5.0, 80+ Gold.", "images/products/a850gl.jpg", "{\"Wattage\": 850}");
            P("Seasonic Focus GX-750", 2500000, 18, 7, 0, 5.0, 0, "750W, full modular, 80+ Gold.", "images/products/gx750.jpg", "{\"Wattage\": 750}");
            P("Cooler Master MWE 650W", 1500000, 25, 7, 5, 5.0, 0, "650W, 80+ Bronze, bán modular.", "images/products/mwe650.jpg", "{\"Wattage\": 650}");
            P("Asus ROG Thor 1200W", 7500000, 5, 7, 0, 5.0, 0, "1200W Platinum, OLED display.", "images/products/rogthor.jpg", "{\"Wattage\": 1200}");
            P("Gigabyte P850GM", 2200000, 20, 7, 0, 5.0, 0, "850W, 80+ Gold, nhỏ gọn.", "images/products/p850gm.jpg", "{\"Wattage\": 850}");
            P("Deepcool PK750D", 1800000, 22, 7, 0, 5.0, 0, "750W, 80+ Bronze, giá tốt.", "images/products/pk750d.jpg", "{\"Wattage\": 750}");
            P("SilverStone Strider 1000W", 3000000, 10, 7, 0, 5.0, 0, "1000W, 80+ Platinum.", "images/products/strider.jpg", "{\"Wattage\": 1000}");
            P("Antec NeoEco 850W", 2500000, 15, 7, 0, 5.0, 0, "850W, 80+ Gold.", "images/products/neoeco.jpg", "{\"Wattage\": 850}");
            P("Super Flower Leadex III", 2800000, 12, 7, 0, 5.0, 0, "850W, 80+ Gold, ultra quiet.", "images/products/leadex.jpg", "{\"Wattage\": 850}");
            P("Nguồn Deepcool PF450 450W 80 Plus", 750000, 40, 7, 0, 0.0, 0, "450W entry-level.", "images/products/pf450.jpg", "{\"Wattage\": 450}");
            P("Nguồn MSI MAG A550BN 550W 80 Plus Bronze", 1030000, 30, 7, 5, 0.0, 0, "550W, 80+ Bronze.", "images/products/a550bn.jpg", "{\"Wattage\": 550}");
            P("Nguồn Corsair CV650 650W 80 Plus Bronze", 1390000, 20, 7, 0, 0.0, 0, "650W, 80+ Bronze.", "images/products/cv650.jpg", "{\"Wattage\": 650}");

            // ===== Tản nhiệt (catId=8) =====
            P("Deepcool LT720 AIO 360mm", 2500000, 12, 8, 0, 5.0, 0, "AIO 360mm, LCD display.", "images/products/lt720.jpg", "{\"Type\": \"Tản nhiệt nước AIO\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"360mm\"}");
            P("NZXT Kraken Elite 360", 7590000, 6, 8, 0, 5.0, 0, "AIO 360mm, LCD 2.36 inch.", "images/products/kraken.jpg", "{\"Type\": \"Tản nhiệt nước AIO\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"360mm\"}");
            P("Corsair iCUE H150i", 4500000, 8, 8, 0, 5.0, 0, "AIO 360mm, iCUE RGB.", "images/products/h150i.jpg", "{\"Type\": \"Tản nhiệt nước AIO\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"360mm\"}");
            P("Noctua NH-D15 Chromax", 2500000, 10, 8, 0, 5.0, 0, "Tản khí huyền thoại, dual tower.", "images/products/nhd15.jpg", "{\"Type\": \"Tản nhiệt khí\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"140mm\"}");
            P("Thermalright Assassin X 120", 600000, 40, 8, 0, 5.0, 0, "Tháp đơn giá rẻ, hiệu năng tốt.", "images/products/ax120.jpg", "{\"Type\": \"Tản nhiệt khí\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"120mm\"}");
            P("Cooler Master MasterLiquid", 3500000, 10, 8, 0, 5.0, 0, "AIO 360mm, ARGB.", "images/products/masterliquid.jpg", "{\"Type\": \"Tản nhiệt nước AIO\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"360mm\"}");
            P("Deepcool AK620 Digital", 1800000, 15, 8, 0, 5.0, 0, "Tháp đôi, màn hình digital.", "images/products/ak620.jpg", "{\"Type\": \"Tản nhiệt khí\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"120mm\"}");
            P("Arctic Liquid Freezer II", 2600000, 12, 8, 0, 5.0, 0, "AIO 360mm, giá tốt nhất.", "images/products/arctic.jpg", "{\"Type\": \"Tản nhiệt nước AIO\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"360mm\"}");
            P("Be Quiet! Dark Rock Pro 4", 1912000, 10, 8, 0, 5.0, 0, "Tháp đôi, silent king.", "images/products/darkrock.jpg", "{\"Type\": \"Tản nhiệt khí\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"135mm\"}");
            P("Tản nhiệt khí ID-Cooling SE-214-XT", 390000, 50, 8, 0, 0.0, 0, "Tháp đơn 4 ống đồng.", "images/products/se214xt.jpg", "{\"Type\": \"Tản nhiệt khí\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"120mm\"}");
            P("Tản nhiệt khí Jonsbo CR-1000 EVO", 320000, 40, 8, 0, 0.0, 0, "Tháp đơn gọn nhẹ.", "images/products/cr1000.jpg", "{\"Type\": \"Tản nhiệt khí\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"120mm\"}");
            P("Tản nhiệt khí Thermalright Assassin X 120 Refined SE", 350000, 30, 8, 0, 0.0, 0, "Phiên bản nâng cấp.", "images/products/ax120-se.jpg", "{\"Type\": \"Tản nhiệt khí\", \"SupportedSockets\": [\"LGA1700\", \"LGA1200\", \"AM5\", \"AM4\"], \"Size\": \"120mm\"}");

            // ===== Chuột (catId=9) =====
            P("DareU LM103 Black", 109000, 100, 9, 0, 4.0, 12, "Chuột gaming giá rẻ, USB.", "images/products/lm103.jpg", "{\"Connection\": \"Có dây (Wired USB)\", \"DPI\": 1000, \"Weight\": \"114g\"}");
            P("DareU EM908 RGB Black", 350000, 50, 9, 0, 4.0, 35, "Chuột gaming RGB, 6000 DPI.", "images/products/em908.jpg", "{\"Connection\": \"Có dây (Wired USB)\", \"DPI\": 6000, \"Weight\": \"87g\"}");
            P("Logitech G102 Lightsync RGB", 390000, 80, 9, 5, 5.0, 120, "Chuột gaming phổ thông nhất.", "images/products/g102.jpg", "{\"Connection\": \"Có dây (Wired USB)\", \"DPI\": 8000, \"Weight\": \"85g\"}");
            P("Logitech G402 Hyperion Fury", 650000, 30, 9, 0, 4.0, 45, "Chuột gaming FPS classic.", "images/products/g402.jpg", "{\"Connection\": \"Có dây (Wired USB)\", \"DPI\": 4000, \"Weight\": \"108g\"}");
            P("DareU EM901X RGB Wireless", 699000, 40, 9, 0, 5.0, 60, "Wireless + có dây, 12000 DPI.", "images/products/em901x.jpg", "{\"Connection\": \"Không dây (Wireless 2.4GHz) + Có dây (Wired USB)\", \"DPI\": 12000, \"Weight\": \"85g\"}");
            P("Logitech G304 Lightspeed Wireless", 720000, 60, 9, 0, 5.0, 210, "Wireless gaming giá tốt nhất.", "images/products/g304.jpg", "{\"Connection\": \"Không dây (Lightspeed 2.4GHz)\", \"DPI\": 12000, \"Weight\": \"99g\"}");
            P("Logitech G502 Hero", 920000, 25, 9, 10, 5.0, 185, "Chuột gaming huyền thoại.", "images/products/g502.jpg", "{\"Connection\": \"Có dây (Wired USB)\", \"DPI\": 25600, \"Weight\": \"121g\"}");
            P("ATK Dragonfly A9 Air Wireless", 1690000, 15, 9, 0, 5.0, 10, "Siêu nhẹ 47g, wireless.", "images/products/a9air.jpg", "{\"Connection\": \"Không dây (Wireless 2.4GHz) + Có dây (Wired USB-C)\", \"DPI\": 42000, \"Weight\": \"47g\"}");
            P("Logitech G Pro X Superlight 2", 3180000, 20, 9, 0, 5.0, 95, "Siêu phẩm eSport wireless.", "images/products/superlight2.jpg", "{\"Connection\": \"Không dây (Lightspeed Wireless) + Có dây (USB-C charging)\", \"DPI\": 44000, \"Weight\": \"60g\"}");
            P("Finalmouse UltralightX Frostlord", 6390000, 5, 9, 0, 5.0, 4, "Siêu nhẹ 33g, 8000Hz polling.", "images/products/frostlord.jpg", "{\"Connection\": \"Không dây (Wireless 8000Hz)\", \"DPI\": 24000, \"Weight\": \"33g\"}");

            // ===== Bàn phím (catId=10) =====
            P("DareU LK145 USB Black", 309000, 100, 10, 0, 4.0, 55, "Bàn phím giả cơ gaming giá rẻ.", "images/products/lk145.jpg", "{\"Layout\": \"Full-size (104 keys)\", \"Switch\": \"Rubber Dome / Optical-like\", \"Connection\": \"Có dây (Wired USB)\"}");
            P("E-Dra EK387L Đen Red Switch", 449000, 50, 10, 0, 5.0, 32, "Bàn phím cơ TKL Red switch.", "images/products/ek387l.jpg", "{\"Layout\": \"TKL (87 keys)\", \"Switch\": \"Red Switch (Linear)\", \"Connection\": \"Có dây (Wired USB-C)\"}");
            P("E-Dra EK398 Alpha Blue Switch", 479000, 40, 10, 0, 4.0, 20, "Bàn phím cơ 98 phím Blue switch.", "images/products/ek398.jpg", "{\"Layout\": \"98 keys\", \"Switch\": \"Blue Switch (Clicky)\", \"Connection\": \"Có dây (Wired USB)\"}");
            P("DareU EK75 White Black Dream Switch", 699000, 80, 10, 16, 5.0, 120, "75% với núm xoay, Dream switch.", "images/products/ek75.jpg", "{\"Layout\": \"75%\", \"Switch\": \"Dream Switch (Linear)\", \"Connection\": \"Có dây (Wired USB)\"}");
            P("AULA S100 Pro Xanh Trắng Tím", 749000, 60, 10, 13, 4.0, 85, "3 mode BT/2.4G/USB, hot-swap.", "images/products/s100pro.jpg", "{\"Layout\": \"Full-size (100 keys)\", \"Switch\": \"Linear Switch\", \"Connection\": \"3 Mode (Dây, 2.4G, Bluetooth)\"}");
            P("DareU EK75 PRO Wireless", 1089000, 35, 10, 15, 5.0, 45, "75% wireless 3 mode, pin 3750mAh.", "images/products/ek75pro.jpg", "{\"Layout\": \"75% (81 keys + knob)\", \"Switch\": \"Dream Switch (Linear)\", \"Connection\": \"3 Mode (Dây, 2.4G, Bluetooth)\"}");
            P("AULA F75 Max 3 Mode Reaper Switch", 1399000, 25, 10, 18, 5.0, 70, "75% TFT screen, Reaper switch.", "images/products/f75max.jpg", "{\"Layout\": \"75% (80 keys + knob + TFT)\", \"Switch\": \"Reaper Switch (Linear)\", \"Connection\": \"3 Mode (Dây, 2.4G, Bluetooth)\"}");
            P("Logitech G515 TKL Lightspeed", 2390000, 18, 10, 20, 5.0, 90, "TKL không dây Lightspeed.", "images/products/g515.jpg", "{\"Layout\": \"TKL (Tenkeyless)\", \"Switch\": \"GL Mechanical (Low-profile, Linear/Tactile)\", \"Connection\": \"3 Mode (Lightspeed Wireless, Bluetooth, Wired USB)\"}");
            P("ASUS ROG Falchion RX Low", 3590000, 15, 10, 17, 5.0, 30, "65% ROG RX optical switch.", "images/products/falchion.jpg", "{\"Layout\": \"65%\", \"Switch\": \"ROG RX Low-profile Optical\", \"Connection\": \"3 Mode (SpeedNova 2.4G, Bluetooth, Wired USB)\"}");
            P("Logitech G715 Aurora Collection", 3999000, 10, 10, 0, 5.0, 15, "TKL Aurora cao cấp, Lightspeed.", "images/products/g715.jpg", "{\"Layout\": \"TKL (Tenkeyless)\", \"Switch\": \"GX Mechanical (Linear/Clicky/Tactile)\", \"Connection\": \"2 Mode (Lightspeed Wireless, Bluetooth)\"}");

            // ===== Màn hình (catId=11) =====
            P("AOC 24B3HM 24 inch FHD VA 100Hz", 1750000, 40, 11, 0, 4.0, 32, "24 inch FHD VA, 100Hz, viền mỏng.", "images/products/24b3hm.jpg", "{\"Size\": \"23.8 inch\", \"Resolution\": \"FHD (1920x1080)\", \"RefreshRate\": \"75Hz\", \"Panel\": \"VA\"}");
            P("ViewSonic VA2432-H 24 inch IPS 100Hz", 1990000, 35, 11, 5, 4.0, 65, "24 inch IPS, bảo vệ mắt.", "images/products/va2432.jpg", "{\"Size\": \"23.8 inch\", \"Resolution\": \"FHD (1920x1080)\", \"RefreshRate\": \"100Hz\", \"Panel\": \"IPS\"}");
            P("LG 24MR400-B 24 inch IPS 100Hz", 2190000, 50, 11, 0, 5.0, 112, "24 inch IPS, FreeSync, viền mỏng.", "images/products/24mr400.jpg", "{\"Size\": \"23.8 inch\", \"Resolution\": \"FHD (1920x1080)\", \"RefreshRate\": \"100Hz\", \"Panel\": \"IPS\"}");
            P("ASUS TUF Gaming VG249Q3A 24 inch Fast IPS 180Hz", 3490000, 25, 11, 10, 5.0, 85, "Gaming eSport 180Hz, 1ms.", "images/products/vg249q3a.jpg", "{\"Size\": \"23.8 inch\", \"Resolution\": \"FHD (1920x1080)\", \"RefreshRate\": \"180Hz\", \"Panel\": \"Fast IPS\"}");
            P("GIGABYTE G24F 2 24 inch IPS 180Hz", 3690000, 30, 11, 0, 4.0, 60, "24 inch IPS 180Hz, 95% DCI-P3.", "images/products/g24f2.jpg", "{\"Size\": \"23.8 inch\", \"Resolution\": \"FHD (1920x1080)\", \"RefreshRate\": \"180Hz (OC từ 165Hz)\", \"Panel\": \"IPS\"}");
            P("LG 27UP600-W 27 inch IPS 4K UHD", 5990000, 15, 11, 5, 5.0, 40, "27 inch 4K, HDR400, đồ họa.", "images/products/27up600.jpg", "{\"Size\": \"27 inch\", \"Resolution\": \"4K UHD (3840x2160)\", \"RefreshRate\": \"60Hz\", \"Panel\": \"IPS\"}");
            P("Dell UltraSharp U2424H 24 inch IPS 120Hz", 6290000, 20, 11, 0, 5.0, 150, "Chuẩn màu chuyên nghiệp.", "images/products/u2424h.jpg", "{\"Size\": \"23.8 inch\", \"Resolution\": \"FHD (1920x1080)\", \"RefreshRate\": \"120Hz\", \"Panel\": \"IPS\"}");
            P("LG UltraGear 27GR95QE-B 27 inch OLED 2K 240Hz", 18990000, 10, 11, 0, 5.0, 25, "OLED 2K 240Hz, 0.03ms.", "images/products/27gr95qe.jpg", "{\"Size\": \"27 inch\", \"Resolution\": \"2K (2560x1440)\", \"RefreshRate\": \"240Hz\", \"Panel\": \"OLED\"}");
            P("ASUS ROG Swift OLED PG27AQDM 27 inch 240Hz", 24990000, 5, 11, 8, 5.0, 12, "OLED đẳng cấp ROG.", "images/products/pg27aqdm.jpg", "{\"Size\": \"26.5 inch\", \"Resolution\": \"2K (2560x1440)\", \"RefreshRate\": \"240Hz\", \"Panel\": \"OLED (WOLED)\"}");
            P("Samsung Odyssey OLED G9 G95SC 49 inch 240Hz", 35990000, 3, 11, 0, 5.0, 8, "49 inch siêu rộng QD-OLED 32:9.", "images/products/g9oled.jpg", "{\"Size\": \"49 inch\", \"Resolution\": \"DQHD (5120x1440)\", \"RefreshRate\": \"240Hz\", \"Panel\": \"OLED (QD-OLED)\"}");

            context.SaveChanges();

            // ===== USERS (9 users) =====
            if (!context.Users.Any())
            {
                context.Users.AddRange(
                    new User { FullName = "string", Email = "admingtgshop@gmail.com", PasswordHash = "$2a$11$Mra1x77lKR2syqzNyFXiRec0kzaTdv8XrJ3XTS7Puwr1zAngliG3G", PhoneNumber = "string", RoleId = 1, CreatedAt = new DateTime(2026, 2, 11) },
                    new User { FullName = "Ngô Đức Huy", Email = "duchuy1292003@gmail.com", PasswordHash = "$2a$11$FfJhnxVlmbFf6tZDyewkdOxqJEOHG7KpUMMN0wkhhArTJaRgmHpgq", PhoneNumber = "0344573591", Address = "Phan Đình Phùng Thái Nguyên", RoleId = 2, CreatedAt = new DateTime(2026, 2, 11) },
                    new User { FullName = "Vũ Ngọc Dân", Email = "vungocdan3182003@gmail.com", PasswordHash = "$2a$11$i3e1G6L9iZRXvCA02EZ/J.x8yR.gOMqJBV.pNXbi2TuM6M7vlJT52", PhoneNumber = "0913153958", RoleId = 2, CreatedAt = new DateTime(2026, 2, 11) },
                    new User { FullName = "Ngô Đức Khải", Email = "ngok4781@gmail.com", PasswordHash = "$2a$11$OekaJkucJ8pGcFgjRZSR5.go.55fUBx85Uv3T5MfHnkAHYs7WWtSy", PhoneNumber = "0812198234", RoleId = 2, CreatedAt = new DateTime(2026, 2, 13) },
                    new User { FullName = "Trần Bình An", Email = "binhan@gmail.com", PasswordHash = "$2a$11$QOn12a7HYhLTumTdPswwJ.xmDmToTKGzX1QJz71Do277bui1.XXtm", PhoneNumber = "0913153958", RoleId = 2, CreatedAt = new DateTime(2026, 2, 13) },
                    new User { FullName = "Tề Tịnh Xuân", Email = "tetinhxuan@gmail.com", PasswordHash = "$2a$11$BUHs1L6wzh9ROuvQanERS.vpT2vuZh5Z6HuKAePmsXYc9uFqoNGGS", PhoneNumber = "0923566356", RoleId = 2, CreatedAt = new DateTime(2026, 2, 13) },
                    new User { FullName = "Nguyễn Nam", Email = "nguyennam267@gmail.com", PasswordHash = "$2a$11$8mtXYDG81reqKbg4dKSlCOJL.HAnPv654AFWYH3EdJR8sdtYA8Q3C", PhoneNumber = "0964176485", Address = "Thái Nguyên", RoleId = 2, CreatedAt = new DateTime(2026, 2, 14) },
                    new User { FullName = "Minh Chiến", Email = "minhchien@gmail.com", PasswordHash = "$2a$11$/PwFem.ycrkKRKa94bSve.xnOGIrlxIumOkUBLHkOa/bS97q5.8Q.", PhoneNumber = "0916743676", RoleId = 2, CreatedAt = new DateTime(2026, 2, 15) },
                    new User { FullName = "Nguyễn Thế Vịnh", Email = "nguyenvinh@gmail.com", PasswordHash = "$2a$11$h.vzrjW.ugnoXXj/41TMuOe8WWaY717UI1DuMz/qVlsOw3Oot.3NC", RoleId = 2, CreatedAt = new DateTime(2026, 2, 24) }
                );
                context.SaveChanges();
            }

            // ===== ORDERS (14 orders) =====
            if (!context.Orders.Any())
            {
                context.Orders.AddRange(
                    new Order { UserId = 2, OrderCode = "ORD202602111326412", TotalAmount = 9750000, ShippingFee = 0, PaymentMethod = "cod", Status = "cancelled", ShippingFullName = "Ngô Đức Huy", ShippingPhone = "0344573591", ShippingAddress = "129", ShippingCity = "Hà Nội", ShippingDistrict = "Yên Lãng", ShippingWard = "Yên Lãng", CancelReason = "Không muốn mua", CreatedAt = new DateTime(2026, 2, 11, 13, 26, 41) },
                    new Order { UserId = 2, OrderCode = "ORD20260211142730", TotalAmount = 5500000, ShippingFee = 0, PaymentMethod = "cod", Status = "shipping", ShippingFullName = "Ngô Đức Huy", ShippingPhone = "0344573591", ShippingAddress = "35", ShippingCity = "Thái Nguyên", ShippingDistrict = "Thái Nguyên", ShippingWard = "Bách Quang", ShippingEmail = "duchuy1292003@gmail.com", CreatedAt = new DateTime(2026, 2, 11, 14, 27, 30) },
                    new Order { UserId = 4, OrderCode = "ORD20260213164621", TotalAmount = 25050000, ShippingFee = 0, PaymentMethod = "cod", Status = "shipping", ShippingFullName = "Ngô Đức Khải", ShippingPhone = "0812198234", ShippingAddress = "2", ShippingCity = "Thái Nguyên", ShippingDistrict = "Đại Phúc", ShippingWard = "Hùng Sơn", ShippingEmail = "ngok4781@gmail.com", CreatedAt = new DateTime(2026, 2, 13, 16, 46, 21) },
                    new Order { UserId = 5, OrderCode = "ORD20260213231810", TotalAmount = 24175000, ShippingFee = 0, PaymentMethod = "cod", Status = "confirmed", ShippingFullName = "Trần Bình An", ShippingPhone = "0913153958", ShippingAddress = "124", ShippingCity = "Hà Nội", ShippingDistrict = "Thanh Xuân", ShippingWard = "Yên Lãng", ShippingEmail = "binhan@gmail.com", CreatedAt = new DateTime(2026, 2, 13, 23, 18, 10) },
                    new Order { UserId = 6, OrderCode = "ORD20260213234943", TotalAmount = 17599000, ShippingFee = 0, PaymentMethod = "cod", Status = "shipping", ShippingFullName = "Tề Tịnh Xuân", ShippingPhone = "0923566356", ShippingAddress = "325", ShippingCity = "Nghệ An", ShippingDistrict = "Nghệ An", ShippingWard = "Nghệ AN", ShippingEmail = "tetinhxuan@gmail.com", CreatedAt = new DateTime(2026, 2, 13, 23, 49, 43) },
                    new Order { UserId = 3, OrderCode = "ORD20260213235606", TotalAmount = 4200000, ShippingFee = 0, PaymentMethod = "cod", Status = "confirmed", ShippingFullName = "Vũ Ngọc Dân", ShippingPhone = "0812198234", ShippingAddress = "129", ShippingCity = "Hà Nội", ShippingDistrict = "Yên Lãng", ShippingWard = "Yên Lãng", ShippingEmail = "vungocdan3182003@gmail.com", CreatedAt = new DateTime(2026, 2, 13, 23, 56, 6) },
                    new Order { UserId = 3, OrderCode = "ORD20260214000013", TotalAmount = 4400000, ShippingFee = 0, PaymentMethod = "cod", Status = "shipping", ShippingFullName = "Vũ Ngọc Dân", ShippingPhone = "0913153958", ShippingAddress = "eq", ShippingCity = "Bắc Giang", ShippingDistrict = "Yên Lãng", ShippingWard = "Bách Quang", ShippingEmail = "vungocdan3182003@gmail.com", CreatedAt = new DateTime(2026, 2, 14, 0, 0, 13) },
                    new Order { UserId = 7, OrderCode = "ORD20260214000313", TotalAmount = 8500000, ShippingFee = 0, PaymentMethod = "cod", Status = "confirmed", ShippingFullName = "Nguyễn Nam", ShippingPhone = "0344573591", ShippingAddress = "34", ShippingCity = "Đồng Tháp", ShippingDistrict = "Yên Lãng", ShippingWard = "Bách Quang", ShippingEmail = "nguyennam267@gmail.com", CreatedAt = new DateTime(2026, 2, 14, 0, 3, 13) },
                    new Order { UserId = 7, OrderCode = "ORD20260214001613", TotalAmount = 6825000, ShippingFee = 0, PaymentMethod = "cod", Status = "pending", ShippingFullName = "Nguyễn Nam", ShippingPhone = "0344573591", ShippingAddress = "35", ShippingCity = "Hà Nội", ShippingDistrict = "Yên Lãng", ShippingWard = "Bách Quang", ShippingEmail = "nguyennam267@gmail.com", CreatedAt = new DateTime(2026, 2, 14, 0, 16, 13) },
                    new Order { UserId = 8, OrderCode = "ORD20260215101420", TotalAmount = 23795000, ShippingFee = 0, PaymentMethod = "cod", Status = "delivered", ShippingFullName = "Minh Chiến", ShippingPhone = "0812198234", ShippingAddress = "17", ShippingCity = "Thái Nguyên", ShippingDistrict = "Sông Công", ShippingWard = "Bách Quang", ShippingEmail = "minhchien@gmail.com", CreatedAt = new DateTime(2026, 2, 15, 10, 14, 20) },
                    new Order { UserId = 9, OrderCode = "ORD20260224234435", TotalAmount = 1942000, ShippingFee = 30000, PaymentMethod = "cod", Status = "pending", ShippingFullName = "Nguyễn Thế Vịnh", ShippingPhone = "0812198234", ShippingAddress = "129", ShippingCity = "Cà Mau", ShippingEmail = "nguyenvinh@gmail.com", CreatedAt = new DateTime(2026, 2, 24, 23, 44, 35) },
                    new Order { UserId = 3, OrderCode = "ORD20260225185252", TotalAmount = 3824000, ShippingFee = 0, PaymentMethod = "vnpay", Status = "confirmed", ShippingFullName = "Vũ Ngọc Dân", ShippingPhone = "0344573591", ShippingAddress = "142", ShippingCity = "Khánh Hòa", ShippingEmail = "vungocdan3182003@gmail.com", PaymentStatus = "paid", CreatedAt = new DateTime(2026, 2, 25, 18, 52, 52) },
                    new Order { UserId = 3, OrderCode = "ORD20260225185546", TotalAmount = 3250000, ShippingFee = 0, PaymentMethod = "vnpay", Status = "confirmed", ShippingFullName = "Vũ Ngọc Dân", ShippingPhone = "0344573591", ShippingAddress = "35", ShippingCity = "Hà Nội", ShippingEmail = "vungocdan3182003@gmail.com", PaymentStatus = "failed", CreatedAt = new DateTime(2026, 2, 25, 18, 55, 46) },
                    new Order { UserId = 3, OrderCode = "ORD20260225185716", TotalAmount = 1782000, ShippingFee = 30000, PaymentMethod = "vnpay", Status = "delivered", ShippingFullName = "Vũ Ngọc Dân", ShippingPhone = "0344573591", ShippingAddress = "142", ShippingCity = "An Giang", ShippingEmail = "vungocdan3182003@gmail.com", PaymentStatus = "failed", CreatedAt = new DateTime(2026, 2, 25, 18, 57, 16) }
                );
                context.SaveChanges();
            }

            // ===== ORDER ITEMS (45 items) =====
            if (!context.OrderItems.Any())
            {
                context.OrderItems.AddRange(
                    // Order 1 (cancelled)
                    new OrderItem { OrderId = 1, ProductId = 1, Quantity = 1, Price = 3000000, ProductName = "Intel Core i9-14900K" },
                    new OrderItem { OrderId = 1, ProductId = 29, Quantity = 1, Price = 2750000, ProductName = "ASUS ROG Z790-E Gaming" },
                    new OrderItem { OrderId = 1, ProductId = 39, Quantity = 1, Price = 800000, ProductName = "Kingston FURY Beast 8GB DDR4" },
                    new OrderItem { OrderId = 1, ProductId = 51, Quantity = 1, Price = 1700000, ProductName = "Samsung 990 Pro 1TB M.2" },
                    new OrderItem { OrderId = 1, ProductId = 61, Quantity = 1, Price = 1500000, ProductName = "NZXT H9 Flow White" },
                    // Order 2
                    new OrderItem { OrderId = 2, ProductId = 1, Quantity = 1, Price = 3000000, ProductName = "Intel Core i9-14900K" },
                    new OrderItem { OrderId = 2, ProductId = 28, Quantity = 1, Price = 2500000, ProductName = "ASUS ROG Z790-E Gaming" },
                    // Order 3
                    new OrderItem { OrderId = 3, ProductId = 1, Quantity = 1, Price = 3000000, ProductName = "Intel Core i9-14900K" },
                    new OrderItem { OrderId = 3, ProductId = 16, Quantity = 1, Price = 5000000, ProductName = "ROG Strix RTX 4090" },
                    new OrderItem { OrderId = 3, ProductId = 38, Quantity = 1, Price = 4500000, ProductName = "ROG STRIX B760-I Gaming" },
                    new OrderItem { OrderId = 3, ProductId = 47, Quantity = 1, Price = 2800000, ProductName = "Corsair Dominator Platinum 64GB" },
                    new OrderItem { OrderId = 3, ProductId = 53, Quantity = 2, Price = 2200000, ProductName = "Samsung 870 EVO 500GB" },
                    new OrderItem { OrderId = 3, ProductId = 60, Quantity = 1, Price = 1250000, ProductName = "Corsair 4000D Airflow" },
                    new OrderItem { OrderId = 3, ProductId = 73, Quantity = 1, Price = 2500000, ProductName = "Asus ROG Thor 1200W" },
                    new OrderItem { OrderId = 3, ProductId = 85, Quantity = 1, Price = 1600000, ProductName = "Cooler Master MasterLiquid" },
                    // Order 4
                    new OrderItem { OrderId = 4, ProductId = 11, Quantity = 1, Price = 4950000, ProductName = "Intel Core i7-12700K" },
                    new OrderItem { OrderId = 4, ProductId = 21, Quantity = 1, Price = 6250000, ProductName = "Sapphire Pulse RX 7900 XTX" },
                    new OrderItem { OrderId = 4, ProductId = 32, Quantity = 1, Price = 3500000, ProductName = "ASUS TUF GAMING B550-PLUS" },
                    new OrderItem { OrderId = 4, ProductId = 44, Quantity = 1, Price = 2050000, ProductName = "Crucial Pro 32GB Kit DDR5" },
                    new OrderItem { OrderId = 4, ProductId = 50, Quantity = 1, Price = 1450000, ProductName = "WD Black SN850X 2TB" },
                    new OrderItem { OrderId = 4, ProductId = 73, Quantity = 1, Price = 2500000, ProductName = "Asus ROG Thor 1200W" },
                    new OrderItem { OrderId = 4, ProductId = 66, Quantity = 1, Price = 2475000, ProductName = "Xigmatek Aquarius Plus" },
                    new OrderItem { OrderId = 4, ProductId = 81, Quantity = 1, Price = 1000000, ProductName = "Corsair iCUE H150i" },
                    // Order 5
                    new OrderItem { OrderId = 5, ProductId = 9, Quantity = 1, Price = 5000000, ProductName = "Intel Core i9-13900KS" },
                    new OrderItem { OrderId = 5, ProductId = 89, Quantity = 1, Price = 12599000, ProductName = "NVIDIA GeForce RTX 5060" },
                    // Order 6
                    new OrderItem { OrderId = 6, ProductId = 88, Quantity = 1, Price = 2200000, ProductName = "Be Quiet! Dark Rock Pro 4" },
                    new OrderItem { OrderId = 6, ProductId = 87, Quantity = 1, Price = 2000000, ProductName = "Arctic Liquid Freezer II" },
                    // Order 7
                    new OrderItem { OrderId = 7, ProductId = 76, Quantity = 1, Price = 2600000, ProductName = "SilverStone Strider 1000W" },
                    new OrderItem { OrderId = 7, ProductId = 86, Quantity = 1, Price = 1800000, ProductName = "Deepcool AK620 Digital" },
                    // Order 8
                    new OrderItem { OrderId = 8, ProductId = 12, Quantity = 1, Price = 5750000, ProductName = "AMD Ryzen 9 5900X" },
                    new OrderItem { OrderId = 8, ProductId = 66, Quantity = 1, Price = 2750000, ProductName = "Xigmatek Aquarius Plus" },
                    // Order 9
                    new OrderItem { OrderId = 9, ProductId = 37, Quantity = 1, Price = 4275000, ProductName = "ASROCK Z790 Steel Legend" },
                    new OrderItem { OrderId = 9, ProductId = 46, Quantity = 1, Price = 2550000, ProductName = "Lexar Thor OC 32GB" },
                    // Order 10
                    new OrderItem { OrderId = 10, ProductId = 10, Quantity = 1, Price = 4725000, ProductName = "AMD Ryzen 7 5700X" },
                    new OrderItem { OrderId = 10, ProductId = 22, Quantity = 1, Price = 6500000, ProductName = "ASUS TUF RX 7800 XT" },
                    new OrderItem { OrderId = 10, ProductId = 32, Quantity = 1, Price = 3500000, ProductName = "ASUS TUF GAMING B550-PLUS" },
                    new OrderItem { OrderId = 10, ProductId = 42, Quantity = 2, Price = 1550000, ProductName = "TeamGroup T-Force Delta RGB 16GB" },
                    new OrderItem { OrderId = 10, ProductId = 57, Quantity = 1, Price = 2720000, ProductName = "Gigabyte AORUS Gen4 2TB" },
                    new OrderItem { OrderId = 10, ProductId = 73, Quantity = 1, Price = 2500000, ProductName = "Asus ROG Thor 1200W" },
                    new OrderItem { OrderId = 10, ProductId = 80, Quantity = 1, Price = 750000, ProductName = "NZXT Kraken Elite 360" },
                    // Order 11
                    new OrderItem { OrderId = 11, ProductId = 128, Quantity = 1, Price = 1912000, ProductName = "Logitech G515 TKL Lightspeed" },
                    // Order 12
                    new OrderItem { OrderId = 12, ProductId = 128, Quantity = 1, Price = 1912000, ProductName = "Logitech G515 TKL Lightspeed" },
                    new OrderItem { OrderId = 12, ProductId = 88, Quantity = 1, Price = 1912000, ProductName = "Be Quiet! Dark Rock Pro 4" },
                    // Order 13
                    new OrderItem { OrderId = 13, ProductId = 87, Quantity = 1, Price = 3250000, ProductName = "Arctic Liquid Freezer II" },
                    // Order 14
                    new OrderItem { OrderId = 14, ProductId = 74, Quantity = 1, Price = 1752000, ProductName = "Gigabyte P850GM" }
                );
                context.SaveChanges();
            }

            // ===== CARTS (9 carts) =====
            if (!context.Carts.Any())
            {
                for (int userId = 1; userId <= 9; userId++)
                {
                    context.Carts.Add(new Cart { UserId = userId, CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now });
                }
                context.SaveChanges();
            }

            // ===== PRODUCT REVIEWS (9 reviews) =====
            if (!context.ProductReviews.Any())
            {
                context.ProductReviews.AddRange(
                    new ProductReview { ProductId = 15, UserId = 1, Rating = 1, Comment = "Yếu vkl", CreatedAt = new DateTime(2026, 2, 12) },
                    new ProductReview { ProductId = 9, UserId = 7, Rating = 4, Comment = "Sản phẩm chất lượng", CreatedAt = new DateTime(2026, 2, 14) },
                    new ProductReview { ProductId = 10, UserId = 8, Rating = 5, Comment = "Đẳng cấp không anh em", CreatedAt = new DateTime(2026, 2, 15) },
                    new ProductReview { ProductId = 22, UserId = 8, Rating = 5, Comment = "Đẳng cấp ko anh em", CreatedAt = new DateTime(2026, 2, 15) },
                    new ProductReview { ProductId = 32, UserId = 8, Rating = 5, Comment = "Đẳng cấp không anh em", CreatedAt = new DateTime(2026, 2, 15) },
                    new ProductReview { ProductId = 42, UserId = 8, Rating = 5, Comment = "Đẳng cấp ko anh em", CreatedAt = new DateTime(2026, 2, 15) },
                    new ProductReview { ProductId = 57, UserId = 8, Rating = 5, Comment = "Đẳng cấp ko anh em", CreatedAt = new DateTime(2026, 2, 15) },
                    new ProductReview { ProductId = 73, UserId = 8, Rating = 5, Comment = "Đẳng cấp không anh em", CreatedAt = new DateTime(2026, 2, 15) },
                    new ProductReview { ProductId = 80, UserId = 8, Rating = 5, Comment = "Đẳng cấp không anh em", CreatedAt = new DateTime(2026, 2, 15) }
                );
                context.SaveChanges();
            }

            // ===== CHAT HISTORIES (sample 10 representative chats) =====
            if (!context.ChatHistories.Any())
            {
                context.ChatHistories.AddRange(
                    new ChatHistory { UserId = 2, UserMessage = "Tài chính có 25 triệu vnd, tôi muốn build pc vừa làm việc vừa chơi game", BotResponse = "Chào bạn, với ngân sách 25 triệu đồng, mình gợi ý bạn cấu hình PC này để vừa làm việc hiệu quả, vừa chiến game mượt mà nhé!", SentAt = new DateTime(2026, 2, 23) },
                    new ChatHistory { UserId = 2, UserMessage = "Cpu và vga có bị nghẽn cổ chai ko", BotResponse = "CPU Intel Core i5-13400F và VGA ASUS Dual RTX 4060 Ti sẽ hoạt động rất ăn ý với nhau và không gặp tình trạng nghẽn cổ chai đáng kể đâu nhé.", SentAt = new DateTime(2026, 2, 23) },
                    new ChatHistory { UserId = 6, UserMessage = "Build PC Gaming 20 triệu", BotResponse = "Chào bạn, mình rất vui được hỗ trợ bạn build một chiếc PC Gaming mạnh mẽ với ngân sách 20 triệu đồng!", SentAt = new DateTime(2026, 2, 16) },
                    new ChatHistory { UserId = 6, UserMessage = "Intel i3-12100 và rtx 5060 có bị nghẽn cổ chai ko", BotResponse = "Câu trả lời là có khả năng cao sẽ bị nghẽn cổ chai bạn nhé. Intel Core i3-12100 là một CPU 4 nhân 8 luồng, không đủ mạnh để phát huy hết sức mạnh RTX 5060.", SentAt = new DateTime(2026, 2, 16) },
                    new ChatHistory { UserId = 7, UserMessage = "PC không lên hình, bàn phím và chuột có sáng, giúp tôi sửa", BotResponse = "Chào bạn, mình hiểu cảm giác khi PC không lên hình mà bàn phím, chuột vẫn sáng. Triệu chứng này thường liên quan đến RAM hoặc VGA. Hãy thử tháo RAM ra lau chân rồi cắm lại nhé!", SentAt = new DateTime(2026, 2, 24) },
                    new ChatHistory { UserId = 7, UserMessage = "Tài chính 50 triệu, mua pc gaming", BotResponse = "Chào bạn, với ngân sách 50 triệu đồng cho PC gaming, GTG SHOP sẽ lên cho bạn một cấu hình cực kỳ mạnh mẽ, chiến mượt mọi tựa game AAA ở 2K và 4K nhé!", SentAt = new DateTime(2026, 2, 24) },
                    new ChatHistory { UserId = 9, UserMessage = "Sửa chữa máy tính", BotResponse = "Chào bạn, mình là trợ lý của GTG SHOP đây! Mình có thể hỗ trợ bạn sửa lỗi phần cứng PC tại nhà. Bạn cho mình biết máy đang gặp vấn đề gì cụ thể không ạ?", SentAt = new DateTime(2026, 2, 24) },
                    new ChatHistory { UserId = 9, UserMessage = "Máy kêu tít tít và không lên màn và tắt hẳn", BotResponse = "Tình trạng máy kêu tít tít, không lên hình rồi tắt hẳn thường liên quan đến RAM hoặc VGA. Các tiếng bíp là mã lỗi từ BIOS. Hãy thử tháo RAM ra lau chân và cắm lại.", SentAt = new DateTime(2026, 2, 24) },
                    new ChatHistory { UserId = 3, UserMessage = "Build Pc gaming 30 triệu", BotResponse = "Chào bạn! Với ngân sách 30 triệu cho PC Gaming, mình sẽ build cho bạn cấu hình mạnh mẽ trên nền tảng AMD AM5 với RAM DDR5 để đảm bảo hiệu năng đỉnh cao!", SentAt = new DateTime(2026, 2, 25) },
                    new ChatHistory { UserId = 3, UserMessage = "bạn làm được gì", BotResponse = "Mình là trợ lý bán hàng và hỗ trợ kỹ thuật của GTG SHOP, chuyên về phần cứng PC. Mình có thể: 1. Tư vấn build PC, 2. Hỗ trợ sửa lỗi phần cứng, 3. Tư vấn nâng cấp linh kiện.", SentAt = new DateTime(2026, 2, 25) }
                );
                context.SaveChanges();
            }
        }
    }
}
