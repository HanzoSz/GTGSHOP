# =======================================================
# KHỐI 1: HTTP -> HTTPS
# =======================================================
server {
    listen 80;
    listen [::]:80;
    server_name api.nghiencongnghe.id.vn www.api.nghiencongnghe.id.vn;

    return 301 https://$host$request_uri;
}

# =======================================================
# KHỐI 2: HTTPS
# =======================================================
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name api.nghiencongnghe.id.vn www.api.nghiencongnghe.id.vn;

    ssl_certificate /etc/ssl/gtgshop-public.pem;
    ssl_certificate_key /etc/ssl/gtgshop-private.key;

    access_log /var/log/nginx/gtgshop-access.log;
    error_log /var/log/nginx/gtgshop-error.log;

    # ==================================================
    # ÉP DOMAIN -> /api
    # ==================================================
    location = / {
        return 301 /api;
    }

    # ==================================================
    # BACKEND API (.NET)
    # ==================================================
    location /api/ {
        proxy_pass http://localhost:5000;

        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-For $http_cf_connecting_ip;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # ==================================================
    # IMAGE SERVER
    # ==================================================
    location /images/ {
        proxy_pass http://localhost:5000;

        expires 30d;
        access_log off;
    }
}