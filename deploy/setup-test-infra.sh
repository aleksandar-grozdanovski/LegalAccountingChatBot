#!/bin/bash
set -e

echo "=== Setting up test environment on dellbox ==="

# 1. Add DNS entry for test environment
echo "Adding legalchat-test.home.arpa to Pi-hole..."
if ! sudo grep -q "legalchat-test.home.arpa" /etc/pihole/pihole.toml; then
  sudo sed -i '/legalchat.home.arpa/a \  "192.168.50.67 legalchat-test.home.arpa",' /etc/pihole/pihole.toml
  echo "✓ DNS entry added"
else
  echo "✓ DNS entry already exists"
fi

echo "Reloading Pi-hole DNS..."
sudo pihole reloaddns

# 2. Add Caddy reverse proxy entry
echo "Configuring Caddy reverse proxy..."
CADDY_FILE="/srv/docker/infra/caddy/Caddyfile"

if ! sudo grep -q "legalchat-test.home.arpa" "$CADDY_FILE"; then
  sudo tee -a "$CADDY_FILE" > /dev/null << 'EOF'

http://legalchat-test.home.arpa {
  reverse_proxy 192.168.50.67:8083
}
EOF
  echo "✓ Caddy entry added"
else
  echo "✓ Caddy entry already exists"
fi

echo "Restarting Caddy..."
cd /srv/docker/infra && sudo docker compose restart caddy

# 3. Add UFW rule for test environment port
echo "Adding UFW rule for port 8083..."
sudo ufw allow from 172.16.0.0/12 to any port 8083 comment 'Docker to legalchatbot-test-frontend'
sudo ufw allow from 172.17.0.0/16 to any port 8083 comment 'Docker default to legalchatbot-test-frontend'

echo ""
echo "=== Test environment infrastructure setup complete ==="
echo ""
echo "You can now:"
echo "1. Deploy test environment: cd /srv/docker/apps/legalchatbot && ./deploy/deploy-test.sh"
echo "2. Access at: http://legalchat-test.home.arpa"
echo "3. Test DNS: nslookup legalchat-test.home.arpa 192.168.50.67"
