
let timeLeft = 300;
function countdown() {
    
    timeLeft--;
    document.querySelector('.timer').innerHTML = String( timeLeft );
    if (timeLeft > 0) {
        setTimeout(countdown, 1000);
    }
}

setTimeout(countdown, 1000);





