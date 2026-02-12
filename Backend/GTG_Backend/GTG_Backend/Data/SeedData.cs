using GTG_Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace GTG_Backend.Data
{
    public static class SeedData
    {
        public static void Initialize(AppDbContext context)
        {
            if (context.Products.Any()) return;
            if (context.Categories.Any()) return;
            // 1. Seed Roles
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Role { RoleName = "Admin" },
                    new Role { RoleName = "Customer" }
                );
                context.SaveChanges();
            }

            // 2. Seed Categories (Đớp khớp chính xác với UI)
            var catCpu = new Category { Name = "CPU - Bộ vi xử lý" };
            var catVga = new Category { Name = "VGA - Card đồ họa" };
            var catMain = new Category { Name = "Mainboard" };
            var catRam = new Category { Name = "RAM" };
            var catDrive = new Category { Name = "SSD / HDD" };
            var catCase = new Category { Name = "Case PC" };
            var catPsu = new Category { Name = "Nguồn PSU" };
            var catCooler = new Category { Name = "Tản nhiệt" };

            context.Categories.AddRange(catCpu, catVga, catMain, catRam, catDrive, catCase, catPsu, catCooler);
            context.SaveChanges();

            // 3. Seed Products (Mở rộng đa dạng mẫu mã)
            // 1. Khai báo danh sách tên sản phẩm cho từng loại (10-15 mẫu mỗi loại)
            var cpuNames = new[] { "Intel Core i9-14900K", "AMD Ryzen 9 7950X", "Intel Core i7-14700K", "AMD Ryzen 7 7800X3D", "Intel Core i5-13400F", "AMD Ryzen i5-12400F", "Intel Core i3-12100F", "AMD Ryzen 5 5600G", "Intel Core i9-13900KS", "AMD Ryzen 7 5700X", "Intel Core i7-12700K", "AMD Ryzen 9 5900X", "Intel Core i3-13100", "AMD Ryzen 5 7600X", "Intel Core i5-14600K" };

            var vgaNames = new[] { "ROG Strix RTX 4090", "MSI RTX 4080 Super Gaming X", "Gigabyte RTX 4070 Ti Eagle", "ASUS Dual RTX 4060 Ti", "Zotac RTX 3060 12GB", "Sapphire Pulse RX 7900 XTX", "ASUS TUF RX 7800 XT", "Galax RTX 4070 Extreme", "Colorful RTX 3050 NB", "Palit RTX 4060 Dual", "EVGA RTX 3080 FTW3", "MSI RX 6750 XT Mech" };

            var mainNames = new[] { "ASUS ROG Z790-E Gaming", "MSI MAG B760M Mortar WIFI", "Gigabyte Z790 AORUS ELITE", "ASROCK B660M Pro RS", "ASUS TUF GAMING B550-PLUS", "MSI MPG X670E Carbon", "Gigabyte B650M Gaming", "ASUS Prime H610M-K", "MSI PRO Z690-A", "ASROCK Z790 Steel Legend", "ROG STRIX B760-I Gaming" };

            var ramNames = new[] { "Corsair Vengeance RGB 32GB DDR5", "G.Skill Trident Z5 Neo 16GB", "Kingston FURY Beast 8GB DDR4", "TeamGroup T-Force Delta RGB 16GB", "Adata XPG Spectrix D50", "Crucial Pro 32GB Kit DDR5", "PNY XLR8 Gaming 16GB", "Lexar Thor OC 32GB", "Corsair Dominator Platinum 64GB", "G.Skill Ripjaws V 16GB" };

            var ssdNames = new[] { "Samsung 990 Pro 1TB M.2", "WD Black SN850X 2TB", "Crucial P5 Plus 500GB", "Kingston NV2 1TB NVMe", "Samsung 870 EVO 500GB", "WD Blue 4TB HDD", "Seagate Barracuda 2TB", "Lexar NM790 1TB", "Gigabyte AORUS Gen4 2TB", "Samsung 970 EVO Plus 1TB" };

            var caseNames = new[] { "NZXT H9 Flow White", "Corsair 4000D Airflow", "Lian Li O11 Dynamic", "Fractal Design North", "Deepcool CH560 Digital", "Cooler Master MasterBox", "Montech Sky Two", "Xigmatek Aquarius Plus", "Mik LV12 Mini Elite", "Sama 3301 Black" };

            var psuNames = new[] { "Corsair RM1000e 80+ Gold", "MSI MAG A850GL PCIE5", "Seasonic Focus GX-750", "Cooler Master MWE 650W", "Asus ROG Thor 1200W", "Gigabyte P850GM", "Deepcool PK750D", "SilverStone Strider 1000W", "Antec NeoEco 850W", "Super Flower Leadex III" };

            var coolerNames = new[] { "Deepcool LT720 AIO 360mm", "NZXT Kraken Elite 360", "Corsair iCUE H150i", "Noctua NH-D15 Chromax", "Thermalright Assassin X 120", "ID-Cooling Zoomflow 360 XT", "Cooler Master MasterLiquid", "Deepcool AK620 Digital", "Arctic Liquid Freezer II", "Be Quiet! Dark Rock Pro 4" };

            // 2. Vòng lặp add dữ liệu tự động (Đảm bảo ID Category khớp với biến đã tạo ở trên)

            void AddSampleProducts(string[] names, int categoryId, string imageName, string extension, long basePrice)
            {
                for (int i = 0; i < names.Length; i++)
                {
                    context.Products.Add(new Product
                    {
                        Name = names[i],
                        Price = basePrice + (i * 250000),
                        Stock = 10 + i,
                        CategoryId = categoryId,
                        // Sử dụng extension truyền vào (ví dụ: .webp, .png, .jpg)
                        ImageUrl = $"/images/products/{imageName}.{extension.Replace(".", "")}",
                        Description = $"Sản phẩm {names[i]} chất lượng cao, bảo hành chính hãng tại GTG Store."
                    });
                }
            }

            // Gọi hàm cho từng loại
            AddSampleProducts(cpuNames, catCpu.Id, "cpu", "jpg", 3000000);
            AddSampleProducts(vgaNames, catVga.Id, "vga", "jpg", 5000000);
            AddSampleProducts(mainNames, catMain.Id, "mainboard", "jpg", 2500000);
            AddSampleProducts(ramNames, catRam.Id, "ram", "jpg", 800000);
            AddSampleProducts(ssdNames, catDrive.Id, "ssd", "jpg", 1200000);
            AddSampleProducts(caseNames, catCase.Id, "case", "jpg", 1000000);
            AddSampleProducts(psuNames, catPsu.Id, "psu", "jpg", 1500000);
            AddSampleProducts(coolerNames, catCooler.Id, "cooler", "jpg", 500000);

            context.SaveChanges();
        }
    }
}