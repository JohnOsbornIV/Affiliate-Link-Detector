document.addEventListener('DOMContentLoaded', async () => {
  const disableBtn = document.getElementById('disable-btn');
  
  disableBtn.addEventListener('click', () => {
    console.log('Disable button clicked');
    
    const instructions = document.getElementById('disable-instructions');
    if (instructions.style.display === 'none') {
      instructions.style.display = 'block';
      disableBtn.textContent = 'Hide Instructions';
    } else {
      instructions.style.display = 'none';
      disableBtn.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 715.636 5.636m12.728 12.728L5.636 5.636"></path>
        </svg>
        How to Disable
      `;
    }
  });
});