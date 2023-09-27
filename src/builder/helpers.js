module.exports = (hb) => {
  hb.registerHelper('isEqual', (arg1, arg2, callback) => {

    return arg1 === arg2 ? callback.fn(this) : callback.inverse(this);

  });


  hb.registerHelper('isInListAndGet', (list, prop1, value, prop2, coalesce, type) => {

    const found = list.find(item => item[prop1] == value)

    if (type == 'Time') {

      return found ? new Date(found[prop2]).toLocaleTimeString() : coalesce

    } else if (type == 'Date') {

      return found ? new Date(found[prop2]).toLocaleDateString() : coalesce

    } else {

      return found ? found[prop2] : coalesce

    }


  });


  hb.registerHelper('isInList', (list, prop, value, callback) => {

    return list[prop] == value ? callback.fn(this) : callback.inverse(this);

  });


  hb.registerHelper('isEqualList', (arg1, arg2, arg3, callback) => {

    return arg1 === arg2 ? callback.fn(arg3) : callback.inverse(this);

  });


  hb.registerHelper("prettifyDate", (timestamp) => {

    return timestamp ? new Date(timestamp).toLocaleDateString("en-US") : '';

  });


  hb.registerHelper("prettifyDateTimeZone", (timestamp, timeZone) => {

    const date = timestamp ? new Date(timestamp).toLocaleDateString("en-US", {timeZone}) : '';

    return date;

  });


  hb.registerHelper("prettifyTime", (timestamp) => {

    return timestamp ? new Date(timestamp).toLocaleTimeString() : '';

  });


  hb.registerHelper("prettifyTimeTimeZone", (timestamp, timeZone, timeFormat) => {

    const is24h = timeFormat === '24h' ? false : true;

    const time = timestamp ? new Date(timestamp).toLocaleTimeString("en-Gb", {

      hour12: is24h,

      hour: '2-digit',

      minute: '2-digit',

      second: '2-digit',

      timeZone: timeZone,

    }) : '';

    return time;

  });


  hb.registerHelper('isLess', (arg1, arg2, callback) => {

    return arg1 > arg2 ? callback.fn(this) : callback.inverse(this);

  });


  hb.registerHelper('isEven', (arg1, arg2, arg3, callback) => {

    return arg1 % arg2 === arg3 ? callback.fn(this) : callback.inverse(this);

  });


  hb.registerHelper('divide', (arg1, arg2) => {

    return (arg1 / arg2).toFixed(2);

  });


  hb.registerHelper('mapRequestAction', (arg1) => {

    return EwayBillStatusMapper[arg1] || arg1;

  });


  hb.registerHelper('add', (arg1, arg2) => {

    return arg1 + arg2;

  });


  hb.registerHelper('findDate', (data, type, requestNumber, timeZone, timeFormat) => {

    let date;

    const is24h = timeFormat === '24h' ? false : true;

    if (type === 'S') {

      date = data.history?.find(item => item.action === 'IN_TRANSIT')?.createdAt;

    } else if (type === 'R') {

      date = data.history?.find(item => item.action === 'GOODS_DELIVERED')?.createdAt;

    } else if (type === 'P') {

      date = data.requests?.find(req => req.requestNumber === requestNumber)?.history.find(item => item.action === 'ARRIVED_AT_PICKUP_LOCATION')?.createdAt;

    } else if (type === 'D') {

      date = data.requests?.find(req => req.requestNumber === requestNumber)?.history.find(item => item.action === 'ARRIVED_AT_DROP_OFF_LOCATION')?.createdAt;

    }

    return date ? `(${new Date(date).toLocaleDateString("en-Gb")} - ${new Date(date).toLocaleTimeString("en-us", {

      hour12: is24h,

      hour: '2-digit',

      minute: '2-digit',

      second: '2-digit',

      timeZone: timeZone,

    })})` : '';

  });


  hb.registerHelper('getBarcode', async (data) => {

    const stream = await createStream({

      symbology: SymbologyType.CODE39

    }, data);

    return `<img src="${stream.data}">`;

  });

  hb.registerHelper('json', function(context) {
    return JSON.stringify(context);
  });
}
