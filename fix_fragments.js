const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// The block we want to replace starts after `<div id="fragment-container"...>`
// Let's just fix the HTML using regex across the file.

let count = 0;
// We look for:
// <div class="fragment-wrapper reveal" style="top: 10%; left: -8%; z-index: 10;" data-speed="45">
//   <div class="fragment-card" data-scale="1.4" data-rot="25" data-title="Peserta UI/UX Inception" data-date="November 2024" data-desc="Partisipan kompetisi UI/UX yang membangun rancangan fungsional dan estetika." style="filter: blur(5px); opacity: 0.25; pointer-events: none;">
// AND we want to shift the 'style="..."' from `.fragment-card` into `.fragment-wrapper`, while stripping `reveal`.

html = html.replace(/<div class="fragment-wrapper reveal"\s+style="([^"]+)"\s+data-speed="([^"]+)">\s*<div class="fragment-card"\s+data-scale="([^"]+)"\s+data-rot="([^"]+)"\s+data-title="([^"]*)"\s+data-date="([^"]*)"\s+data-desc="([^"]*)"(?:([^>]*)style="([^"]+)")?>/g, (match, wStyle, speed, scale, rot, title, date, desc, beforeStyle, cStyle) => {
    
    // Extract blur and opacity from cStyle
    let blurMatch = cStyle ? cStyle.match(/blur\(([^)]+)\)/) : null;
    let opMatch = cStyle ? cStyle.match(/opacity:\s*([\d.]+)/) : null;
    
    let blur = blurMatch ? blurMatch[1] : '0px';
    let op = opMatch ? opMatch[1] : '1';
    
    // Append the card style to the wrapper style
    let newWStyle = `${wStyle} ${cStyle || ''}`;
    
    let res = `<div class="fragment-wrapper" style="${newWStyle}" data-speed="${speed}" data-blur="${blur}" data-orig-op="${op}">
          <div class="fragment-card" data-scale="${scale}" data-rot="${rot}" data-title="${title}" data-date="${date}" data-desc="${desc}">`;
    count++;
    return res;
});

// Fix the js to handle filter transition
html = html.replace(/wrapper\.style\.zIndex = 101;/g, `wrapper.style.zIndex = 101; 
          
          gsap.to(wrapper, {
              filter: "blur(0px)",
              opacity: 1,
              duration: 0.8
          });`);
          
html = html.replace(/wrapper\.style\.zIndex = wrapper\.getAttribute\('data-orig-z'\) \|\| 1;/g, `wrapper.style.zIndex = wrapper.getAttribute('data-orig-z') || 1;
              }
            }, 600);
            
            gsap.to(wrapper, {
              filter: wrapper.getAttribute('data-blur') ? \`blur(\${wrapper.getAttribute('data-blur')})\` : "blur(0px)",
              opacity: parseFloat(wrapper.getAttribute('data-orig-op')) || 1,
              duration: 0.7
            });
            // dummy comment to prevent replace breakage:
            setTimeout(() => { if(false) { `);

fs.writeFileSync('index.html', html);
console.log('Fixed ' + count + ' fragment wrappers.');
