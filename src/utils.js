import moment from "moment";
import Cookies from "universal-cookie";
const cookies = new Cookies();

/**
 * Transform a numeric string into a dollar format
 * @param {string} number - number to be formated
 */
export function formatToDollars(number, micro = false) {
  return formatTo("$", number, micro);
}

export function formatTo(symbol, number, micro = false) {
  if (micro) {
    number = number / 1000000;
  }
  if (symbol == "$") {
    var formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    return formatter.format(number);
  }

  return number + " " + symbol;
}

/**
 * Transform a string in camelCase into readable words
 * @param {string} text
 */
export function camelToWords(text) {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

export function utcToLocal(utcTime) {
  const momentUtc = moment.utc(utcTime).local().format();
  return moment(momentUtc).local().format("YYYY-MM-DD HH:mm:ss");
}

export function setCookie(name, value) {
  cookies.set(value, name);
}

export function getCookie(name) {
  cookies.get(name);
}

export function removeCookie(name) {
  cookies.remove(name);
}

export function titleToToolTip(str) {
  return str.split(" ").map((term) => term.slice(0, 1).toLowerCase() + term.slice(1, term.length)).join("_");
}
