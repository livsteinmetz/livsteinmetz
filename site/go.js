// Send visitors on the old Firebase addresses to the same page on livsteinmetz.com.
if (/^livsteinmetz\.(web|firebaseapp)\.(app|com)$/.test(location.hostname)) location.replace(`https://livsteinmetz.com${location.pathname}${location.search}${location.hash}`);
