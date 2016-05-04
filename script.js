window.onload = function() {
  var vehicalState = 'parked';

  $('#accelerate').on('click', function() {
    handleInput('accelerate');
  });
  $('#deAccelerate').on('click', function() {
    handleInput('deAccelerate');
  });
  $('#removeKeys').on('click', function() {
    handleInput('removeKeys');
  });
  $('#insertKeys').on('click', function() {
    handleInput('insertKeys');
  });

  var handleInput = function(command) {
    switch (vehicalState) {
      case 'reverse':
        switch (command) {
          case 'accelerate':
            set('stopped');
            break;
          case 'deAccelerate':
            info();
            break;
          case 'removeKeys':
            warn(command);
            break;
          case 'insertKeys':
            warn(command);
            break;
          default:
            error();
            break;
        }
        break;
      case 'stopped':
        switch (command) {
          case 'accelerate':
            set('driving');
            break;
          case 'deAccelerate':
            set('reverse');
            break;
          case 'removeKeys':
            set('parked');
            break;
          case 'insertKeys':
            warn(command);
            break;
          default:
            error();
            break;
        }
        break;
      case 'driving':
        switch (command) {
          case 'accelerate':
            info();
            break;
          case 'deAccelerate':
            set('stopped');
            break;
          case 'removeKeys':
            warn(command);
            break;
          case 'insertKeys':
            warn(command);
            break;
          default:
            error();
            break;
        }
        break;
      case 'parked':
        switch (command) {
          case 'accelerate':
            warn(command);
            break;
          case 'deAccelerate':
            warn(command);
            break;
          case 'removeKeys':
            info();
            break;
          case 'insertKeys':
            set('stopped');
            break;
          default:
            error();
            break;
        }
        break;
      default:
        error();
        break;
    }
  }

  var set = function(vS) {
    $('#log').append('<div class="info">setting vehical to state:' + vS + '</div>');
    vehicalState = vS;
  }
  var info = function() {
    $('#log').append('<div class="info">remaining in state:' + vehicalState + '</div>');
  }
  var warn = function(command) {
    $('#log').append('<div class="warn">command:' + command + ' in state:' + vehicalState + ' is not allowed</div>');
  }
  var error = function() {
    $('#log').append('<div class="error">vehical is in an unknown state:' + vehicalState + ' switching to stopped</div>');
    vehicalState = 'stopped';
  }
};