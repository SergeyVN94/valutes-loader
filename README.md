# Loading currency rates

Скрипт для загрузки криптовалют.
Используется в панели polybar.

Вставка в polybar:
```INI
[module/exchange-rates]
type = custom/script
exec = "node PATH-TO-SCRIPT/rates.js"
tail = true

label = %output%

format = <label>
format-underline = #a6e
```

Для получения списка криптовалют нужен ключ.  
Его нужно получить на сайте min-api.cryptocompare.com и вставить в поле apiKey, объекта crypto.
