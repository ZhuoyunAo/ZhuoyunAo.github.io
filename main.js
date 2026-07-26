
// INTERFACE ADJUSTMENTS
document.getElementById("searchTabInput").click();  // select default query tab
document.getElementById("contentTabOutput").click(); // select default query tab
$("input").focus(function() { this.select() });      // select all input text on focus

// maxrecords slider
var maxrec_slider = document.getElementById("maxrecords");
document.getElementById("maxrecordslab").innerHTML = maxrec_slider.value; // initialise
var smooth_slider = document.getElementById("timelinesmooth");
document.getElementById("timelinesmoothlab").innerHTML = smooth_slider.value; // initialise


// TIME/DATE

var daterange = $('input[name="daterange"]').daterangepicker({
  locale: { format: dtft },
  maxDate: end_date.format(dtft),
  minDate: start_date.format(dtft),
  startDate: start_date.format(dtft),
  endDate: end_date.format(dtft)
});

function updateDate(picker){ // read input widget and update data objects
  var start_date = picker.startDate.startOf('day');
  var end_date = picker.endDate.endOf('day');
  update_query('startdatetime', start_date.format('YYYYMMDDHHmmss'), buildhash = false);
  update_query('enddatetime', end_date.format('YYYYMMDDHHmmss'));
}

setTimeout(function() { // not sure why needed but without it listener fails to initialise
  $('#datetime').on('apply.daterangepicker', function(ev, picker) {
    updateDate(picker); 
  });
}, 1000);


// $(function() { daterange; }); // date range setup


// CONFIGURE TABS

function manageInputTabs(evt, tabName) {
  var inputTabContent = document.getElementsByClassName("inputTab");
  for (var i = 0; i < inputTabContent.length; i++) { inputTabContent[i].style.display = "none"; }
  var inputTabLinks = document.getElementsByClassName("inputTabLinks");
  for (var i = 0; i < inputTabLinks.length; i++) {
    inputTabLinks[i].className = inputTabLinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
  // iframe_zoom(2);
}

var current_tab = 'tab_content'; // global

function manageOutputTabs(evt, tabName) {
  var outputTabContent = document.getElementsByClassName("outputTab");
  for (i = 0; i < outputTabContent.length; i++) { outputTabContent[i].style.display = "none"; }
  var outputTabLinks = document.getElementsByClassName("outputTabLinks");
  for (i = 0; i < outputTabLinks.length; i++) {
    outputTabLinks[i].className = outputTabLinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  // trigger changes on tab switch
  if(tabName == 'tab_content') {
    if(VERBOSE) { clog('switch to tab_content'); }
    current_tab = 'tab_content';
    $('#doc_results_options').appendTo("#tab_content"); // ie. move output options to this tab
    $('#maxrecordsdiv').show();
    $('#sortdiv').show();
    $('#analysis_buttons_div').hide();
    $('#timelinesmoothdiv').hide();
    if(LIVE){ update_query('api', 'doc'); }
  }
  if(tabName == 'tab_timeline') {
    if(VERBOSE) clog('switch to tab_timeline');
    current_tab = 'tab_timeline';
    $('#doc_results_options').appendTo("#tab_timeline");
    $('#timelinesmoothdiv').show();
    $('#maxrecordsdiv').hide();
    $('#sortdiv').hide();
    $('#analysis_buttons_div').show();
    if(LIVE){ update_query('api', 'doc'); }
  }
  if(tabName == 'tab_geo') {
    if(VERBOSE) clog('switch to tab_geo');
    current_tab = 'tab_geo';
    if(LIVE){ update_query('api', 'geo'); }
  }
  if(tabName == 'tab_tv') {
    current_tab = 'tab_tv';
    $('#doc_results_options').appendTo("#tab_tv");
    $('#timelinesmoothdiv').show();
    $('#maxrecordsdiv').hide();
    $('#sortdiv').hide();
    $('#analysis_buttons_div').show();
    if(LIVE){ update_query('api', 'tv'); }
  }
  // iframe_zoom(2);
}


// update non-selectize elements with hash arguments
if(window.location.hash != ''){
  for(var i=0; i<init_argset_keys.length; i++) {
    var id = init_argset_keys[i];
    if(id != 'api' && selectized_ids.indexOf(id) == -1) {
      if(VERBOSE) clog('set ' + id + ' element value to ' + init_argset[id]);
      if(['startdatetime','enddatetime'].indexOf(id) == -1){
        if(['trans','domainis'].indexOf(id) > -1){
          document.getElementById(id).checked = query[id];         // checkboxes
        } else { if(id != 'timezoom') document.getElementById(id).value = query[id]; }  // text inputs
      } else {
        if(id == 'startdatetime'){
          var sd = init_argset.startdatetime; // 20170405000000
          var ed = init_argset.enddatetime;   // 20170406235959
          $('#datetime').daterangepicker({
            startDate: [sd.substr(4,2), sd.substr(6,2), sd.substr(0,4)].join('/'), 
            endDate: [ed.substr(4,2), ed.substr(6,2), ed.substr(0,4)].join('/') 
          });
          $('#timespan').val('')
          updateDate( $('#datetime').data('daterangepicker') );
        }
      }
      if(id == 'maxrecords') document.getElementById('maxrecordslab').innerHTML = init_argset[id];
      if(id == 'timelinesmooth') document.getElementById('timelinesmoothlab').innerHTML = init_argset[id];
    }
  }
}


// LOAD MENU OPTIONS AND CONFIGURE INPUT SELECT ELEMENTS

function selectize_blur(id) {
  var select = $(id).selectize();
  var selectize = select[0].selectize;
  selectize.blur();
}

function selectize_add_new(id, vals) {
  if(!$.isArray(vals)) vals = [vals];
  var d = [];
  for(var i=0; i<vals.length; i++) { d.push({'name':vals[i],'code':vals[i]}); }
  var $select = $(id).selectize();
  var selectize = $select[0].selectize;
  selectize.addOption(d);
  for(var i=0; i<vals.length; i++) { selectize.addItem(d[i].name); }
  if(VERBOSE) clog('selectize add: ' + id + ' [' + vals + ']');
}

function selectize_element (id, max_items, options, title) {
  if(max_items > 0) {
    $(id).selectize({
      valueField: 'code',
      labelField: 'name',
      searchField: 'name',
      maxItems: max_items,
      options: options,
      create: true,
      persist: false,
      delimiter: ',',
      allowEmptyOption: true
    });

    var id0 = c(id).replace(/#/, '');
    if(query[id0]) { selectize_add_new(id, query[id0]); }
  }
  $(id + ' + div').attr('title', title); // add title tooltip
  $(id).change(function() { update_query(c(id), c($(id).val())); }); // event listener
}

// ENHANCED: Rate-limited menu data loader using queue_ajax from init.js
function load_menu_data (fn, ids, max_items, title) {
  if(VERBOSE) clog(fn + ' start');
  
  queue_ajax(
    fn,
    function(options) {
      if(fn == "data/LOOKUP-IMAGETAGS.json" || fn == "data/LOOKUP-GKGTHEMES.json"){
        for(var i=0; i<options.length; i++) { options[i].name = options[i].code + ' (' + options[i].n + ')'; }
      }
      if(fn == "//api.gdeltproject.org/api/v2/tv/tv?mode=stationdetails&format=json"){
        options = options.station_details;
        for(var i=0; i<options.length; i++) { options[i].name = options[i].callsign + ' (' + options[i].network + ')'; }
      }
      if(fn.indexOf('.json') == -1){
        if(!options.results) {  alert('Check internet connection or network error'); return; }
        options = options.results;
      }
      for(var i=0; i<ids.length; i++) { selectize_element( '#' + ids[i], max_items, options, title ); }
      if(VERBOSE) clog(fn + ' end');
    },
    function(err) { 
      clog(err);
    }
  );
}

function pad (str, max) { str = str.toString(); return str.length < max ? pad("0" + str, max) : str; }

function manage_event(id, target, report, val) {
  if(val == '') { return; }
  var idx = query[id].indexOf(val);
  if(idx == -1) {
    if(query[id].length) {query[id] += ',' + val;} else {query[id] = val;}
  } else { // remove this val from query[id]
    query[id] = query[id].replace(val, '').replace(/^,|,$/g, '').replace(/,,/g, ',');
  }
  update_query(id, query[id]);
  $(target).val(''); // clear input box
}

function checkboxDomain() { update_query('domainis', !query.domainis); }
function checkboxTrans() { update_query('trans', !query.trans); } // translate non-English content
function checkboxImageBool() { action_query(); } // Image tag boolean option
function checkboxThemeBool() { action_query(); } // Theme tag boolean option

function slider_record_count() {
  var slider_val = document.getElementById("maxrecords").value;
  document.getElementById("maxrecordslab").innerHTML = slider_val;
  update_query('maxrecords', slider_val);
}

function slider_timeline_smooth() {
  var slider_val = document.getElementById("timelinesmooth").value;
  document.getElementById("timelinesmoothlab").innerHTML = slider_val;
  update_query('timelinesmooth', slider_val);
}

function toggle_toggle_button(element) {
  $(element).toggleClass('active');
}

// initialises page once HTML, CSS and init.js loaded
LIVE = true;

// set initial labels for sliders
var maxrec_slider = document.getElementById("maxrecords");
if(maxrec_slider) { maxrec_slider.onchange = function () { slider_record_count(); } }
var smooth_slider = document.getElementById("timelinesmooth");
if(smooth_slider) { smooth_slider.onchange = function () { slider_timeline_smooth(); } }
