/* XO Event Calendar plugin */

if (!Element.prototype.matches) {
  Element.prototype.matches = Element.prototype.msMatchesSelector || 
                              Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
  Element.prototype.closest = function(s) {
    var el = this;

    do {
      if (el.matches(s)) return el;
      el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);
    return null;
  };
}

xo_event_calendar_month = function(e, month, event, categories, holidays, prev, next, start_of_week, months, navigation, mhc) {
  var target = e.closest('.xo-event-calendar');
  var id = target.getAttribute('id');
  var request = new XMLHttpRequest(); 

  target.setAttribute('disabled', 'disabled');
  target.classList.add('xoec-loading')

  request.onreadystatechange = function () {
    if (request.readyState === 4) {
      if ((200 <= request.status && request.status < 300)) {
        target.classList.remove('xoec-loading');
        target.getElementsByClassName('xo-months')[0].innerHTML = request.response;
      } else {
      }
    }
  };

  request.open('POST', xo_event_calendar_object.ajax_url, true);
  request.setRequestHeader('content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
  request.send(
    'action=' + xo_event_calendar_object.action +
    '&id=' + id +
    '&month=' + month +
    '&event=' + event +
    '&categories=' + categories +
    '&holidays=' + holidays +
    '&prev=' + prev +
    '&next=' + next +
    '&start_of_week=' + start_of_week +
    '&months=' + months +
    '&navigation=' + navigation +
    '&mhc=' + mhc
  );

  return false;
}
