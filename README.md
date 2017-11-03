# Telegram Notifer

Send telegram messages throw HTTP API.

Scripts:

```bash
# Build
docker build -t smartapp/telegram-notifier:latest .
# Run
docker run -it --rm \
  -e TOKEN='%token%' \
  -e URL='http://notifier.smartapp.com.ua' \
  -p '8080:8080' \
  smartapp/telegram-notifier:latest
```
