export default function fixString(str: string) {
    str = str.replaceAll('_', ' ');
    let splitted = str.split(' ');
    splitted = splitted.map(st => st.slice(0, 1).toUpperCase() + st.slice(1).toLowerCase());
    return splitted.join(' ');
}
