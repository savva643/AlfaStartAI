FROM nginx:alpine

# Remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy our config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove entrypoint scripts that overwrite configs
RUN rm -f /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
