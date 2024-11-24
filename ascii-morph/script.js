const canvas = document.getElementById('ascii-canvas');

// ASCII Art Shapes
const shapes = [`
                _ooOoo_,
               o8888888o,
               88" . "88,
               (| -_- |),
               O\  =  /O,
            ____/'---'\____,
          .'  \\|     |//  '.,
         /  \\|||  :  |||//  \,
        /  _||||| -:- |||||_  \,
        |   | \\\  -  /'| |   |,
        | \_|  '\`---'//  |_/ |,
        \  .-\__ '-. -'__/-.  /,
      ___'. .'  /--.--\  '. .'___,
   ."" '<  '.___\_<|>_/___.' _> \"",
  | | :  '- \`. ;'. _/; .'/ /  .' ; |,
  \  \ '-.   \_\_'. _.'_/_/  -' _.' /,
==='-.'___'-.__\ \___  /__.-'_.'_.-'===,
                '=--=-'    
`,

`
                             /,
                            /,
                           /;,
                          //,
                         ;/,
                       ,//,
                   _,-' ;_,,,
                _,'-_  ;|,',
            _,-'_,..--. |,
    ___   .'-'_)'  ) _)\|      ___,
  ,""""''' _  )   ) _)  ''--'''_,-',
-={-o-  /|    )  _)  ) ; '_,--'',
  \ -' ,'.  ) .)  _)_,''|,
   '."(   '------''     /,
     '.\             _,',
       '-.____....-\\,
                 || \\,
                 // ||,
                //  ||,
            _-.//_ _||_,,
              ,'  ,-'/
`,

`
      \ \     ___,
       \ \   / __>0,
   /\  /  |/' / ,
  /  \/   '  ,''--.,
 / /(___________)_ \,
 |/ //.-.   .-.\\ \ \,
 0 // :@ ___ @: \\ \/,
   ( o ^(___)^ o ) 0,
    \ \_______/ /,
/\   '._______.'--.,
\ /|  |<_____>    |,
 \ \__|<_____>____/|__,
  \____<_____>_______/,
      |<_____>    |,
      |<_____>    |,
      :<_____>____:,
     / <_____>   /|,
    /  <_____>  / |,
   /___________/  |,
   |           | _|__,
   |           | ---||_,
   |   |L\/|/  |  | [__],
   |  \||||\|\ |  /,
   |           | /,
   |___________|/
`,

`
     .--------.,
    / .------. \,
   / /        \ \,
   | |        | |,
  _| |________| |_,
.' |_|        |_| '.,
'._____ ____ _____.',
|     .'____'.     |,
'.__.'.'    '.'.__.',
'.__  |      |  __.',
|   '.'.____.'.'   |,
'.____'.____.'____.',
'.________________.'
`,

`
         ____,
        o8%8888,,
      o88%8888888.,
     8'-    -:8888b,
    8'         8888,
   d8.-=. ,==-.:888b,
   >8 '~' :'~' d8888,
   88         ,88888,
   88b. '-~  ':88888,
   888b ~==~ .:88888,
   88888o--:':::8888,
   '88888| :::' 8888b,
   8888^^'       8888b,
  d888           ,%888b.,
 d88%            %%%8--'-.,
/88:.__ ,       _%-' ---  -,
    '''::===..-'   =  --.  '
`,

`
      _      _      _
   __(.)< __(.)> __(.)=
   \___)  \___)  \___)  
          _      _      _
       __(.)< __(.)> __(.)=
       \___)  \___)  \___)   
      _      _      _
   __(.)< __(.)> __(.)=
   \___)  \___)  \___)   
          _      _      _
       __(.)< __(.)> __(.)=
       \___)  \___)  \___)  
`];

// Get a random shape from the array
function getRandomShape() {
    return shapes[Math.floor(Math.random() * shapes.length)];
}

// Morphing effect between two shapes
function morphText(currentText, targetText) {
    let result = '';
    const maxLength = Math.max(currentText.length, targetText.length);
    
    for (let i = 0; i < maxLength; i++) {
        const currentChar = currentText[i] || ' ';
        const targetChar = targetText[i] || ' ';
        
        if (currentChar === targetChar) {
            result += currentChar;
        } else {
            // Create morphing effect with random intermediate characters
            const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
            result += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    
    return result;
}

// Animation function
function animate() {
    let currentShape = getRandomShape();
    canvas.textContent = currentShape;

    setInterval(() => {
        const nextShape = getRandomShape();
        let morphingPhase = 0;
        
        const morphInterval = setInterval(() => {
            if (morphingPhase < 10) {
                canvas.textContent = morphText(currentShape, nextShape);
                morphingPhase++;
            } else {
                canvas.textContent = nextShape;
                currentShape = nextShape;
                clearInterval(morphInterval);
            }
        }, 100);
    }, 3000);
}

animate();
