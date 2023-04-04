const { bgBlue, black, green } = require("chalk");

function dateTimePad(value: number, digits: number) {
  let number = value.toString();
  while (number.toString().length < digits) {
    number = "0" + number;
  }
  return number;
}

function format(tDate: Date) {
  return (
    tDate.getFullYear() +
    "-" +
    dateTimePad(tDate.getMonth() + 1, 2) +
    "-" +
    dateTimePad(tDate.getDate(), 2) +
    " " +
    dateTimePad(tDate.getHours(), 2) +
    ":" +
    dateTimePad(tDate.getMinutes(), 2) +
    ":" +
    dateTimePad(tDate.getSeconds(), 2) +
    "." +
    dateTimePad(tDate.getMilliseconds(), 3)
  );
}

type LogType = "log" | "warn" | "error" | "debug" | "cmd" | "ready";

export default function logger(content: any, type: LogType = "log") {
  const date = `[${format(new Date(Date.now()))}]`;
  switch (type) {
    case "log": {
      return console.log(`${date} ${bgBlue(type.toUpperCase())} ${content}`);
    }
    case "warn": {
      return console.log(
        `${date} ${black.bgYellow(type.toUpperCase())} ${content}`
      );
    }
    case "error": {
      return console.log(
        `${date} ${black.bgRed(type.toUpperCase())} ${content}`
      );
    }
    case "debug": {
      return console.log(`${date} ${green(type.toUpperCase())} ${content}`);
    }
    case "cmd": {
      return console.log(
        `${date} ${black.bgWhite(type.toUpperCase())} ${content}`
      );
    }
    case "ready": {
      return console.log(
        `${date} ${black.bgGreen(type.toUpperCase())} ${content}`
      );
    }
  }
}
