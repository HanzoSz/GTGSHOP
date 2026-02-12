import axios from 'axios';

const API_URL = 'https://localhost:7033/api';
const IMAGE_BASE_URL = 'https://localhost:7033';

// Ảnh mặc định theo category
const defaultImages: Record<number, string> = {
    1: 'images/products/cpu.jpg',
    2: 'images/products/vga.jpg',
    3: 'images/products/mainboard.jpg',
    4: 'images/products/ram.jpg',
    5: 'images/products/ssd.jpg',
    6: 'images/products/case.jpg',
    7: 'images/products/psu.jpg',
    8: 'images/products/cooler.jpg',
};

export async function getProducts() {
    try {
        const response = await axios.get(`${API_URL}/products`);
        console.log("Raw API data:", response.data);
        
        return response.data.map((item: any) => {
            const categoryId = Number(item.categoryId || item.CategoryId) || 1;
            
            // Lấy imageUrl từ API
            let rawImageUrl = item.imageUrl || item.ImageUrl || '';
            
            // Nếu không có imageUrl, dùng ảnh mặc định theo category
            if (!rawImageUrl) {
                rawImageUrl = defaultImages[categoryId] || 'images/products/cpu.jpg';
            }
            
            // Xây dựng URL đầy đủ
            let imageUrl = '';
            if (rawImageUrl.startsWith('http')) {
                imageUrl = rawImageUrl;
            } else {
                const cleanPath = rawImageUrl.replace(/^\/+/, '');
                imageUrl = `${IMAGE_BASE_URL}/${cleanPath}`;
            }
            
            console.log("Product:", item.name || item.Name, "Image:", imageUrl);
            
            return {
                id: item.id || item.Id,
                name: item.name || item.Name,
                price: item.price || item.Price,
                originalPrice: item.originalPrice || item.OriginalPrice || Math.round((item.price || item.Price) * 1.2),
                image: imageUrl,
                rating: item.rating || item.Rating || 4.5,
                reviews: item.reviews || item.Reviews || 10,
                discount: item.discount || item.Discount || 20,
                categoryId: categoryId
            };
        });
    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        return [];
    }
}

// Thêm hàm lấy sản phẩm theo categoryId
export async function getProductsByCategory(categoryId: number) {
    try {
        const response = await axios.get(`${API_URL}/products?categoryId=${categoryId}`);
        return response.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.originalPrice || item.price * 1.2,
            image: item.imageUrl 
                ? (item.imageUrl.startsWith('http') 
                    ? item.imageUrl 
                    : `${IMAGE_BASE_URL}/${item.imageUrl}`)
                : '/placeholder.png',
            rating: item.rating || 4.5,
            reviews: item.reviews || 10,
            discount: item.discount || 20,
            categoryId: item.categoryId
        }));
    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        return [];
    }
}