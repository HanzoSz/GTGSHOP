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
            const price = Number(item.price || item.Price) || 0;
            const discount = Number(item.discount || item.Discount) || 0;

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

            // Tính giá thật dựa trên discount từ database
            const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
            const originalPrice = discount > 0 ? price : undefined;

            return {
                id: item.id || item.Id,
                name: item.name || item.Name,
                price: finalPrice,
                originalPrice: originalPrice,
                image: imageUrl,
                rating: item.rating || item.Rating || 0,
                reviews: item.reviews || item.Reviews || 0,
                discount: discount > 0 ? discount : undefined,
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
        return response.data.map((item: any) => {
            const price = Number(item.price || item.Price) || 0;
            const discount = Number(item.discount || item.Discount) || 0;
            const finalPrice = discount > 0 ? Math.round(price * (1 - discount / 100)) : price;

            return {
                id: item.id,
                name: item.name,
                price: finalPrice,
                originalPrice: discount > 0 ? price : undefined,
                image: item.imageUrl
                    ? (item.imageUrl.startsWith('http')
                        ? item.imageUrl
                        : `${IMAGE_BASE_URL}/${item.imageUrl}`)
                    : '/placeholder.png',
                rating: item.rating || 0,
                reviews: item.reviews || 0,
                discount: discount > 0 ? discount : undefined,
                categoryId: item.categoryId
            };
        });
    } catch (error) {
        console.error("Lỗi kết nối API:", error);
        return [];
    }
}

// ============== ADMIN PRODUCT API ==============

function getAuthHeaders() {
    const token = localStorage.getItem('admin_token');
    return {
        'Authorization': `Bearer ${token}`,
    };
}

// Interface cho response phân trang
export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// Interface cho sản phẩm admin
export interface AdminProduct {
    id: number;
    name: string;
    price: number;
    stock: number;
    description: string;
    categoryId: number;
    categoryName?: string;
    imageUrl: string;
    discount: number;
    rating: number;
    reviews: number;
}

// Interface cho danh mục
export interface Category {
    id: number;
    name: string;
}

// Lấy danh sách danh mục
export async function getCategories(): Promise<Category[]> {
    try {
        const response = await axios.get(`${API_URL}/categories`);
        return response.data.map((item: any) => ({
            id: item.id || item.Id,
            name: item.name || item.Name,
        }));
    } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
        return [];
    }
}

// Lấy danh sách sản phẩm admin (có phân trang, tìm kiếm, lọc)
export async function getAdminProducts(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number | null;
    status?: string;
}): Promise<PaginatedResponse<AdminProduct>> {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
        if (params.search) queryParams.set('search', params.search);
        if (params.categoryId) queryParams.set('categoryId', params.categoryId.toString());
        if (params.status) queryParams.set('status', params.status);

        const response = await axios.get(
            `${API_URL}/admin/products?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        const data = response.data;

        // Nếu API trả về mảng đơn giản (chưa có phân trang phía backend)
        if (Array.isArray(data)) {
            const items = data.map(mapAdminProduct);
            return {
                items,
                totalItems: items.length,
                totalPages: 1,
                currentPage: 1,
                pageSize: items.length,
            };
        }

        // Nếu API trả về object có phân trang
        return {
            items: (data.items || data.Items || []).map(mapAdminProduct),
            totalItems: data.totalItems || data.TotalItems || 0,
            totalPages: data.totalPages || data.TotalPages || 1,
            currentPage: data.currentPage || data.CurrentPage || 1,
            pageSize: data.pageSize || data.PageSize || 10,
        };
    } catch (error) {
        console.error("Lỗi lấy danh sách sản phẩm admin:", error);
        return { items: [], totalItems: 0, totalPages: 1, currentPage: 1, pageSize: 10 };
    }
}

function mapAdminProduct(item: any): AdminProduct {
    const rawImageUrl = item.imageUrl || item.ImageUrl || '';
    let imageUrl = '';
    if (rawImageUrl && rawImageUrl.startsWith('http')) {
        imageUrl = rawImageUrl;
    } else if (rawImageUrl) {
        const cleanPath = rawImageUrl.replace(/^\/+/, '');
        imageUrl = `${IMAGE_BASE_URL}/${cleanPath}`;
    }
    return {
        id: item.id || item.Id,
        name: item.name || item.Name,
        price: item.price || item.Price,
        stock: item.stock || item.Stock || 0,
        description: item.description || item.Description || '',
        categoryId: item.categoryId || item.CategoryId,
        categoryName: item.categoryName || item.CategoryName || '',
        imageUrl: imageUrl,
        discount: item.discount || item.Discount || 0,
        rating: item.rating || item.Rating || 0,
        reviews: item.reviews || item.Reviews || 0,
    };
}

// Tạo sản phẩm mới
export async function createProduct(productData: {
    name: string;
    price: number;
    stock: number;
    description: string;
    categoryId: number;
    imageUrl: string;
    discount: number;
}): Promise<{ success: boolean; message?: string; product?: AdminProduct }> {
    try {
        const response = await axios.post(
            `${API_URL}/admin/products`,
            productData,
            { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
        );
        return { success: true, product: mapAdminProduct(response.data) };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.data?.Message || 'Lỗi tạo sản phẩm';
        console.error("Lỗi tạo sản phẩm:", error);
        return { success: false, message: msg };
    }
}

// Cập nhật sản phẩm
export async function updateProduct(id: number, productData: {
    name: string;
    price: number;
    stock: number;
    description: string;
    categoryId: number;
    imageUrl: string;
    discount: number;
}): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.put(
            `${API_URL}/admin/products/${id}`,
            productData,
            { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
        );
        return { success: true };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.data?.Message || 'Lỗi cập nhật sản phẩm';
        console.error("Lỗi cập nhật sản phẩm:", error);
        return { success: false, message: msg };
    }
}

// Xóa sản phẩm
export async function deleteProduct(id: number): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.delete(
            `${API_URL}/admin/products/${id}`,
            { headers: getAuthHeaders() }
        );
        return { success: true };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.data?.Message || 'Lỗi xóa sản phẩm';
        console.error("Lỗi xóa sản phẩm:", error);
        return { success: false, message: msg };
    }
}

// Upload ảnh sản phẩm
export async function uploadProductImage(file: File): Promise<{ success: boolean; imageUrl?: string; message?: string }> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
            `${API_URL}/admin/products/upload-image`,
            formData,
            {
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const data = response.data;
        return {
            success: true,
            imageUrl: data.imageUrl || data.ImageUrl || data.url || data.Url || '',
        };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.data?.Message || 'Lỗi upload ảnh';
        console.error("Lỗi upload ảnh:", error);
        return { success: false, message: msg };
    }
}

// ============== ADMIN ORDER API ==============

export interface AdminOrderItem {
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
}

export interface AdminOrder {
    id: number;
    orderCode: string;
    createdAt: string;
    updatedAt?: string;
    status: string;
    statusText: string;
    totalAmount: number;
    shippingFee: number;
    paymentMethod: string;
    shippingFullName: string;
    shippingPhone: string;
    shippingEmail?: string;
    shippingAddress: string;
    shippingCity?: string;
    shippingDistrict?: string;
    shippingWard?: string;
    note?: string;
    cancelReason?: string;
    items: AdminOrderItem[];
    customerName?: string;
    customerEmail?: string;
}

// Lấy danh sách đơn hàng cho admin (phân trang, tìm kiếm, lọc)
export async function getAdminOrders(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}): Promise<PaginatedResponse<AdminOrder>> {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
        if (params.search) queryParams.set('search', params.search);
        if (params.status && params.status !== 'all') queryParams.set('status', params.status);

        const response = await axios.get(
            `${API_URL}/admin/orders?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        const data = response.data;

        // Hỗ trợ cả 2 format: paginated hoặc array
        if (Array.isArray(data)) {
            const mapped = data.map(mapAdminOrder);
            return {
                items: mapped,
                totalItems: mapped.length,
                totalPages: 1,
                currentPage: 1,
                pageSize: mapped.length,
            };
        }

        return {
            items: (data.items || data.Items || []).map(mapAdminOrder),
            totalItems: data.totalItems || data.TotalItems || data.totalCount || 0,
            totalPages: data.totalPages || data.TotalPages || 1,
            currentPage: data.currentPage || data.CurrentPage || 1,
            pageSize: data.pageSize || data.PageSize || 10,
        };
    } catch (error) {
        console.error('Lỗi lấy danh sách đơn hàng admin:', error);
        return { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 };
    }
}

// Cập nhật trạng thái đơn hàng
export async function updateOrderStatus(
    orderId: number,
    status: string
): Promise<{ success: boolean; message?: string }> {
    try {
        await axios.put(
            `${API_URL}/admin/orders/${orderId}/status`,
            { status },
            { headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } }
        );
        return { success: true };
    } catch (error: any) {
        const msg = error.response?.data?.message || error.response?.data?.Message || 'Lỗi cập nhật trạng thái';
        console.error('Lỗi cập nhật trạng thái:', error);
        return { success: false, message: msg };
    }
}

// Helper map order data
function mapAdminOrder(o: any): AdminOrder {
    return {
        id: o.id || o.Id,
        orderCode: o.orderCode || o.OrderCode || '',
        createdAt: o.createdAt || o.CreatedAt || '',
        updatedAt: o.updatedAt || o.UpdatedAt,
        status: (o.status || o.Status || 'pending').toLowerCase(),
        statusText: o.statusText || o.StatusText || '',
        totalAmount: o.totalAmount || o.TotalAmount || 0,
        shippingFee: o.shippingFee || o.ShippingFee || 0,
        paymentMethod: o.paymentMethod || o.PaymentMethod || 'cod',
        shippingFullName: o.shippingFullName || o.ShippingFullName || '',
        shippingPhone: o.shippingPhone || o.ShippingPhone || '',
        shippingEmail: o.shippingEmail || o.ShippingEmail,
        shippingAddress: o.shippingAddress || o.ShippingAddress || '',
        shippingCity: o.shippingCity || o.ShippingCity,
        shippingDistrict: o.shippingDistrict || o.ShippingDistrict,
        shippingWard: o.shippingWard || o.ShippingWard,
        note: o.note || o.Note,
        cancelReason: o.cancelReason || o.CancelReason,
        items: (o.items || o.Items || o.orderItems || o.OrderItems || []).map((item: any) => ({
            productId: item.productId || item.ProductId,
            productName: item.productName || item.ProductName || '',
            productImage: item.productImage || item.ProductImage || '',
            quantity: item.quantity || item.Quantity || 1,
            price: item.price || item.Price || 0,
        })),
        customerName: o.customerName || o.CustomerName || o.shippingFullName || o.ShippingFullName || '',
        customerEmail: o.customerEmail || o.CustomerEmail || o.shippingEmail || o.ShippingEmail,
    };
}

// ============== ADMIN USER API ==============

export interface AdminUser {
    id: number;
    fullName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    createdAt: string;
    roleName: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate?: string;
}

export interface AdminUserRecentOrder {
    id: number;
    orderCode: string;
    createdAt: string;
    status: string;
    totalAmount: number;
    itemCount: number;
}

export interface AdminUserDetail extends AdminUser {
    recentOrders: AdminUserRecentOrder[];
}

export interface AdminUserStats {
    totalUsers: number;
    totalAdmins: number;
    newUsersThisMonth: number;
    usersWithOrders: number;
}

// Lấy danh sách users cho admin (phân trang, tìm kiếm, lọc)
export async function getAdminUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
}): Promise<PaginatedResponse<AdminUser>> {
    try {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
        if (params.search) queryParams.set('search', params.search);
        if (params.role && params.role !== 'all') queryParams.set('role', params.role);

        const response = await axios.get(
            `${API_URL}/admin/users?${queryParams.toString()}`,
            { headers: getAuthHeaders() }
        );

        const data = response.data;

        if (Array.isArray(data)) {
            const mapped = data.map(mapAdminUser);
            return {
                items: mapped,
                totalItems: mapped.length,
                totalPages: 1,
                currentPage: 1,
                pageSize: mapped.length,
            };
        }

        return {
            items: (data.items || data.Items || []).map(mapAdminUser),
            totalItems: data.totalItems || data.TotalItems || 0,
            totalPages: data.totalPages || data.TotalPages || 1,
            currentPage: data.currentPage || data.CurrentPage || 1,
            pageSize: data.pageSize || data.PageSize || 10,
        };
    } catch (error) {
        console.error('Lỗi lấy danh sách users admin:', error);
        return { items: [], totalItems: 0, totalPages: 0, currentPage: 1, pageSize: 10 };
    }
}

// Lấy chi tiết user
export async function getAdminUserDetail(userId: number): Promise<AdminUserDetail | null> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/users/${userId}`,
            { headers: getAuthHeaders() }
        );
        const data = response.data;
        return {
            ...mapAdminUser(data),
            recentOrders: (data.recentOrders || data.RecentOrders || []).map((o: any) => ({
                id: o.id || o.Id,
                orderCode: o.orderCode || o.OrderCode || '',
                createdAt: o.createdAt || o.CreatedAt || '',
                status: (o.status || o.Status || '').toLowerCase(),
                totalAmount: o.totalAmount || o.TotalAmount || 0,
                itemCount: o.itemCount || o.ItemCount || 0,
            })),
        };
    } catch (error) {
        console.error('Lỗi lấy chi tiết user:', error);
        return null;
    }
}

// Lấy thống kê users
export async function getAdminUserStats(): Promise<AdminUserStats> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/users/stats`,
            { headers: getAuthHeaders() }
        );
        const d = response.data;
        return {
            totalUsers: d.totalUsers || d.TotalUsers || 0,
            totalAdmins: d.totalAdmins || d.TotalAdmins || 0,
            newUsersThisMonth: d.newUsersThisMonth || d.NewUsersThisMonth || 0,
            usersWithOrders: d.usersWithOrders || d.UsersWithOrders || 0,
        };
    } catch (error) {
        console.error('Lỗi lấy thống kê users:', error);
        return { totalUsers: 0, totalAdmins: 0, newUsersThisMonth: 0, usersWithOrders: 0 };
    }
}

// Helper map user data
function mapAdminUser(u: any): AdminUser {
    return {
        id: u.id || u.Id,
        fullName: u.fullName || u.FullName || '',
        email: u.email || u.Email || '',
        phoneNumber: u.phoneNumber || u.PhoneNumber,
        address: u.address || u.Address,
        createdAt: u.createdAt || u.CreatedAt || '',
        roleName: u.roleName || u.RoleName || 'Customer',
        orderCount: u.orderCount || u.OrderCount || 0,
        totalSpent: u.totalSpent || u.TotalSpent || 0,
        lastOrderDate: u.lastOrderDate || u.LastOrderDate,
    };
}

// ============== ADMIN DASHBOARD API ==============

export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    ordersThisMonth: number;
    ordersLastMonth: number;
    customersThisMonth: number;
    customersLastMonth: number;
}

export interface DashboardRecentOrder {
    id: number;
    orderCode: string;
    shippingFullName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    itemCount: number;
}

export interface DashboardTopProduct {
    productId: number;
    productName: string;
    totalSold: number;
    totalRevenue: number;
}

export interface DashboardOrdersByStatus {
    status: string;
    count: number;
}

export interface DashboardData {
    stats: DashboardStats;
    recentOrders: DashboardRecentOrder[];
    topProducts: DashboardTopProduct[];
    ordersByStatus: DashboardOrdersByStatus[];
}

export async function getAdminDashboard(): Promise<DashboardData> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/dashboard`,
            { headers: getAuthHeaders() }
        );
        const d = response.data;
        const s = d.stats || d.Stats || {};

        return {
            stats: {
                totalRevenue: s.totalRevenue || s.TotalRevenue || 0,
                totalOrders: s.totalOrders || s.TotalOrders || 0,
                totalProducts: s.totalProducts || s.TotalProducts || 0,
                totalCustomers: s.totalCustomers || s.TotalCustomers || 0,
                revenueThisMonth: s.revenueThisMonth || s.RevenueThisMonth || 0,
                revenueLastMonth: s.revenueLastMonth || s.RevenueLastMonth || 0,
                ordersThisMonth: s.ordersThisMonth || s.OrdersThisMonth || 0,
                ordersLastMonth: s.ordersLastMonth || s.OrdersLastMonth || 0,
                customersThisMonth: s.customersThisMonth || s.CustomersThisMonth || 0,
                customersLastMonth: s.customersLastMonth || s.CustomersLastMonth || 0,
            },
            recentOrders: (d.recentOrders || d.RecentOrders || []).map((o: any) => ({
                id: o.id || o.Id,
                orderCode: o.orderCode || o.OrderCode || '',
                shippingFullName: o.shippingFullName || o.ShippingFullName || '',
                totalAmount: o.totalAmount || o.TotalAmount || 0,
                status: (o.status || o.Status || '').toLowerCase(),
                createdAt: o.createdAt || o.CreatedAt || '',
                itemCount: o.itemCount || o.ItemCount || 0,
            })),
            topProducts: (d.topProducts || d.TopProducts || []).map((p: any) => ({
                productId: p.productId || p.ProductId,
                productName: p.productName || p.ProductName || '',
                totalSold: p.totalSold || p.TotalSold || 0,
                totalRevenue: p.totalRevenue || p.TotalRevenue || 0,
            })),
            ordersByStatus: (d.ordersByStatus || d.OrdersByStatus || []).map((s: any) => ({
                status: (s.status || s.Status || '').toLowerCase(),
                count: s.count || s.Count || 0,
            })),
        };
    } catch (error) {
        console.error('Lỗi lấy dashboard:', error);
        return {
            stats: {
                totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalCustomers: 0,
                revenueThisMonth: 0, revenueLastMonth: 0, ordersThisMonth: 0, ordersLastMonth: 0,
                customersThisMonth: 0, customersLastMonth: 0,
            },
            recentOrders: [],
            topProducts: [],
            ordersByStatus: [],
        };
    }
}

// ============== ADMIN ANALYTICS API ==============

export interface AnalyticsKeyMetrics {
    totalRevenue: number;
    ordersToday: number;
    newCustomersToday: number;
    cancelRate: number;
    totalOrders: number;
    cancelledOrders: number;
}

export interface AnalyticsRevenuePoint {
    date: string;
    fullDate: string;
    revenue: number;
    isThisWeek: boolean;
}

export interface AnalyticsCategorySale {
    categoryId: number;
    categoryName: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface AnalyticsTopSeller {
    productId: number;
    productName: string;
    totalSold: number;
    totalRevenue: number;
    averagePrice: number;
    currentStock: number;
    imageUrl?: string;
}

export interface AnalyticsData {
    keyMetrics: AnalyticsKeyMetrics;
    revenueChart: AnalyticsRevenuePoint[];
    revenueThisWeek: number;
    revenueLastWeek: number;
    categorySales: AnalyticsCategorySale[];
    topSellers: AnalyticsTopSeller[];
}

export async function getAdminAnalytics(): Promise<AnalyticsData> {
    try {
        const response = await axios.get(
            `${API_URL}/admin/analytics`,
            { headers: getAuthHeaders() }
        );
        const d = response.data;
        const km = d.keyMetrics || d.KeyMetrics || {};

        return {
            keyMetrics: {
                totalRevenue: km.totalRevenue || km.TotalRevenue || 0,
                ordersToday: km.ordersToday || km.OrdersToday || 0,
                newCustomersToday: km.newCustomersToday || km.NewCustomersToday || 0,
                cancelRate: km.cancelRate || km.CancelRate || 0,
                totalOrders: km.totalOrders || km.TotalOrders || 0,
                cancelledOrders: km.cancelledOrders || km.CancelledOrders || 0,
            },
            revenueChart: (d.revenueChart || d.RevenueChart || []).map((p: any) => ({
                date: p.date || p.Date || '',
                fullDate: p.fullDate || p.FullDate || '',
                revenue: p.revenue || p.Revenue || 0,
                isThisWeek: p.isThisWeek ?? p.IsThisWeek ?? false,
            })),
            revenueThisWeek: d.revenueThisWeek || d.RevenueThisWeek || 0,
            revenueLastWeek: d.revenueLastWeek || d.RevenueLastWeek || 0,
            categorySales: (d.categorySales || d.CategorySales || []).map((c: any) => ({
                categoryId: c.categoryId || c.CategoryId,
                categoryName: c.categoryName || c.CategoryName || '',
                totalQuantity: c.totalQuantity || c.TotalQuantity || 0,
                totalRevenue: c.totalRevenue || c.TotalRevenue || 0,
            })),
            topSellers: (d.topSellers || d.TopSellers || []).map((t: any) => ({
                productId: t.productId || t.ProductId,
                productName: t.productName || t.ProductName || '',
                totalSold: t.totalSold || t.TotalSold || 0,
                totalRevenue: t.totalRevenue || t.TotalRevenue || 0,
                averagePrice: t.averagePrice || t.AveragePrice || 0,
                currentStock: t.currentStock || t.CurrentStock || 0,
                imageUrl: t.imageUrl || t.ImageUrl,
            })),
        };
    } catch (error) {
        console.error('Lỗi lấy analytics:', error);
        return {
            keyMetrics: { totalRevenue: 0, ordersToday: 0, newCustomersToday: 0, cancelRate: 0, totalOrders: 0, cancelledOrders: 0 },
            revenueChart: [],
            revenueThisWeek: 0,
            revenueLastWeek: 0,
            categorySales: [],
            topSellers: [],
        };
    }
}