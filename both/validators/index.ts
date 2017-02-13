export function isValidEmail (address) {
  return /\S+@\S+\.\S+/.test(address);
};

export function isValidFirstName (value) {
    return /^\w(\w|\s|['.])*$/.test(value);
};

export function isValidPhoneNum (value) {
    return /^\+?[0-9\(\)\-\.\ ]{7,20}[0-9]{3}$/.test(value);
}

export function isValidSSN (value) {
    return /^[0-9]{3}\-?[0-9]{2}\-?[0-9]{4}$/.test(value);
}

export function isValidPasswd (value) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\(\)\-\_\=\+\{\}\[\]\;\:\'\"\,\.\<\>\/\\\|\?])(?=.{8,})/.test(value);
}

export function isValidSlug(value) {
    return /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(value);
}

export function isValidCode(value) {
    return /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(value);
}