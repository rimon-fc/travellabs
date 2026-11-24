(() => {
 const board=document.querySelector('.canvas-board');if(!board)return;
 const surface=board.querySelector('.canvas-board-surface'),space=board.querySelector('.canvas-board-space'),viewport=board.querySelector('.canvas-board-viewport'),output=board.querySelector('[data-board-scale]');let scale=.85;
 function zoom(value){scale=Math.max(.3,Math.min(1.3,value));surface.style.setProperty('--board-scale',scale);space.style.width=(920*scale)+'px';space.style.height=(570*scale)+'px';output.textContent=Math.round(scale*100)+'%';board.querySelector('[data-board-zoom=out]').disabled=scale<=.3;board.querySelector('[data-board-zoom=in]').disabled=scale>=1.3;}
 board.querySelectorAll('[data-board-zoom]').forEach(button=>button.addEventListener('click',()=>{const action=button.dataset.boardZoom;zoom(action==='fit'?(viewport.clientWidth-4)/920:scale+(action==='in'?.1:-.1));}));zoom(.85);
})();
