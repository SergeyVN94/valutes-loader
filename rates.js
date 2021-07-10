const request = require('request');
const xmlParser = require('fast-xml-parser');

const TIMEOUT = 1000 * 60 * 40;
const xmlParseOptions = {
  ignoreAttributes : false,
};

const outputItems = {};
const updateOutput = (name, value) => {
  outputItems[name] = value;

  const output = [];

  Object.entries(outputItems).forEach(([_, value]) => {
    if (value) output.push(value);
  });

  if (output.length === 0) {
    console.log('Отсутствуют данные по курсам валют');
  } else {
    console.log(output.join(' / '));
  }
};

const crypto = {
  LABEL: 'crypto',
  apiKey: '',
  url: 'https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD,RUB',

  update() {
    request(this.url, {
      headers: {
        Apikey: this.apiKey,
      },
    }, (error, response, body) => {
      updateOutput(this.LABEL, 'Загрузка курса криптовалют...');

      if (error || !response) {
        updateOutput(this.LABEL, 'Ошибка при загрузке курса криптовалют');
        return;
      }
  
      if (response.statusCode !== 200) {
        updateOutput(this.LABEL, `Ошибка при загрузке курса криптовалют. Код ответа ${statusCode}.`);
      }
  
      try {
        const jsonObj = JSON.parse(body);
        this.cryptoToStr(jsonObj);
  
        setTimeout(() => this.update(), TIMEOUT);
      } catch (error) {
        updateOutput(this.LABEL, 'Ошибка при загрузке курса криптовалют');
      }
    });
  },

  cryptoToStr(obj) {
    const USD = (parseFloat(String(obj.USD))).toLocaleString('ru');
    const RUB = (parseFloat(String(obj.RUB))).toLocaleString('ru');
    const res = `Курс биткоина - ${USD} USD | ${RUB} RUB`;
    updateOutput(this.LABEL, res);
  }
};

const valute = {
  LABEL: 'valute',
  URL: 'https://www.cbr.ru/scripts/XML_daily.asp',
  valuteCodes: ['USD', 'EUR'],
  valuteNames: {
    'USD': 'Доллар США',
    'EUR': 'Евро',
  },

  update() {
    request(this.getURL(), (error, response, body) => {
      updateOutput(this.LABEL, 'Загрузка курса валют...');

      if (error || !response) {
        updateOutput(this.LABEL, 'Ошибка при загрузке курса валют');
        return;
      }
  
      if (response.statusCode !== 200) {
        updateOutput(this.LABEL, `Ошибка при загрузке курса валют. Код ответа ${statusCode}.`);
      }
  
      try {
        if (!xmlParser.validate(body)) throw '';
  
        const jsonObj = xmlParser.parse(body, xmlParseOptions);
        updateOutput(this.LABEL, this.exchangeRateToStr(jsonObj));
  
        setTimeout(() => this.update(), TIMEOUT);
      } catch (error) {
        updateOutput(this.LABEL, 'Ошибка при загрузке курса валют');
      }
    });
  },

  getURL(currentDate = false) {
    if (currentDate) {
      const d = new Date();
      const date = [
        d.getDate(),
        d.getMonth(),
        d.getFullYear(),
      ].map((i) => i.toString().padStart(2, '0')).join('/');
  
      return `${this.URL}?date_req=${date}`;
    }
    
    return this.URL;
  },

  exchangeRateToStr({ ValCurs }) {
    const { Valute } = ValCurs;
    const output = [];
  
    Valute
      .filter(({ CharCode }) => this.valuteCodes.includes(CharCode))
      .forEach(({ Value, CharCode }) => {
        const name = this.valuteNames[CharCode];
        const [cost1, cost2] = Value.split(',');
        const cost = `${cost1}.${String(cost2).slice(0, 2)}`;
        output.push(`${name} - ${cost}`);
      });
  
    if (ValCurs['@_Date']) output.unshift(ValCurs['@_Date']);
  
    return output.join(' | ');
  },
};

crypto.update();
valute.update();
