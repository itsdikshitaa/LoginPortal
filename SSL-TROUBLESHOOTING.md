# SSL/HTTPS Troubleshooting Guide

## Error: ERR_SSL_PROTOCOL_ERROR

**Cause:** Accessing the application via HTTPS when the server is not configured with SSL certificates.

### Quick Fix

**Option 1: Access via HTTP (Development)**
```
http://13.63.53.209:5000
```
Instead of `https://13.63.53.209`

**Option 2: Setup HTTPS with Nginx + Let's Encrypt (Recommended for Production)**

Follow the guide in [NGINX-SSL-SETUP.md](NGINX-SSL-SETUP.md)

---

## Common SSL/HTTPS Issues and Solutions

### Issue 1: ERR_SSL_PROTOCOL_ERROR
- **Cause:** Server doesn't have SSL certificates
- **Solution:** Use nginx reverse proxy with Let's Encrypt (see NGINX-SSL-SETUP.md)

### Issue 2: Certificate Not Trusted
- **Cause:** Using self-signed certificates or expired Let's Encrypt certificate
- **Solution:** 
  - Use Let's Encrypt (automatically renewed)
  - For self-signed certs, add exception in browser

### Issue 3: Mixed Content Error
- **Cause:** HTTPS page loading HTTP resources
- **Solution:** 
  - Ensure all resources use HTTPS
  - Check `public/js` and `public/css` files for hardcoded `http://` URLs
  - Set `Content-Security-Policy` headers

### Issue 4: Connection Refused on Port 443
- **Cause:** AWS Security Group doesn't allow port 443
- **Solution:**
  - Go to AWS EC2 Console
  - Edit Security Group Inbound Rules
  - Add rule: HTTPS (443) from 0.0.0.0/0

### Issue 5: Certificate Authority (CA) Bundle Error
- **Cause:** Missing intermediate SSL certificates
- **Solution:**
  - Certbot handles this automatically
  - Verify: `sudo certbot certificates`

---

## Verification Checklist

### For Development (HTTP on Port 5000)
```bash
✓ Server running on http://0.0.0.0:5000
✓ Access via http://your-ec2-ip:5000
✓ MongoDB connected
✓ No SSL certificates needed
```

### For Production (HTTPS)
```bash
✓ Nginx installed and configured
✓ Let's Encrypt certificate obtained
✓ NODE_ENV=production in .env
✓ HOST=127.0.0.1 in .env (listen locally only)
✓ AWS Security Group allows port 443
✓ DNS record points to EC2 IP
✓ App accessible via https://yourdomain.com
```

---

## Testing Commands

### Check if application is running on port 5000
```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Check if port 5000 is listening
sudo netstat -tuln | grep 5000
# or
sudo ss -tuln | grep 5000
```

### Check nginx reverse proxy status
```bash
sudo systemctl status nginx
sudo nginx -t
```

### View nginx error logs
```bash
sudo tail -f /var/log/nginx/error.log
```

### Check SSL certificate
```bash
sudo certbot certificates
openssl s_client -connect your-ec2-ip:443
```

### Test HTTPS access
```bash
curl -I https://your-ec2-ip
curl -I https://yourdomain.com
```

---

## Step-by-Step Resolution

### If Getting ERR_SSL_PROTOCOL_ERROR:

1. **Check what's running:**
   ```bash
   pm2 status
   sudo systemctl status nginx
   ```

2. **If nginx is not running:**
   ```bash
   sudo systemctl start nginx
   ```

3. **If Node app isn't running:**
   ```bash
   pm2 restart login-portal
   ```

4. **Check logs:**
   ```bash
   pm2 logs login-portal
   sudo tail -f /var/log/nginx/error.log
   ```

5. **Try accessing without HTTPS first:**
   ```
   http://your-ec2-ip:5000
   ```

6. **If HTTP works but HTTPS doesn't:**
   - Run nginx SSL setup (see NGINX-SSL-SETUP.md)
   - Or access via HTTP:5000 temporarily

---

## Production Deployment Checklist

- [ ] nginx installed and configured
- [ ] Let's Encrypt certificate obtained
- [ ] NODE_ENV=production set in .env
- [ ] SESSION_SECRET set to secure random value in .env
- [ ] MONGODB_URI points to production database in .env
- [ ] AWS Security Group allows ports 80, 443, 22
- [ ] AWS Security Group blocks port 5000 from external access
- [ ] pm2 configured to auto-start on reboot
- [ ] SSL certificate auto-renewal enabled
- [ ] Firewall configured (UFW if used)
- [ ] Application logs monitored

---

## Quick Commands Reference

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# View app status
pm2 status
pm2 logs login-portal

# Restart app
pm2 restart login-portal

# Restart nginx
sudo systemctl restart nginx

# Check ports in use
sudo ss -tuln

# View nginx error log
sudo tail -f /var/log/nginx/error.log

# Check SSL certificate
sudo certbot certificates

# Renew SSL certificate
sudo certbot renew
```

---

## Further Help

For detailed nginx setup with Let's Encrypt: See [NGINX-SSL-SETUP.md](NGINX-SSL-SETUP.md)

For AWS EC2 setup: See [AWS-EC2-SETUP.md](AWS-EC2-SETUP.md)

For local development setup: See [QUICK-START.md](QUICK-START.md)
