const GIS = {
  temp: '',
  auditenddate: '',
  auditstartdate: '',
  toastType: {
    Info: 'info',
    Error: 'error',
    Success: 'success',
    Warning: 'warning'
  },
  toastTitle: 'GIS Notification Service'
};
let whos = null;
let oTable = '';
const api = '/api/';
const excludeKeys = 'id, created_by, deleted_at, category, updated_at';

toastr.options = {
  closeButton: true,
  debug: false,
  newestOnTop: false,
  progressBar: true,
  positionClass: 'toast-top-right',
  preventDuplicates: true,
  onclick: null,
  showDuration: '300',
  hideDuration: '1000',
  timeOut: '5000',
  extendedTimeOut: '1000',
  showEasing: 'swing',
  hideEasing: 'linear',
  showMethod: 'fadeIn',
  hideMethod: 'fadeOut'
};

function Notify(toastType, toastMessage) {
  toastr[toastType](toastMessage, GIS.toastTitle);
}

function setEditables() {
  const _caller = $('.linkactive').text();
  const dataForm = $('.linkactive').data('api');

  $('#dataStatus a').editable({
    value: true,
    radiolist: {
      linebreak: true
    },
    source: [
      { value: true, text: ' Activate', class: 'btn btn-md btn-default btn-info active', display: 'fa fa-thumbs-o-up' },
      { value: false, text: ' Deactivate', class: 'btn btn-md btn-default btn-danger', display: 'fa fa-thumbs-o-down' }
    ],
    ajaxOptions: {
      type: 'put',
      dataType: 'json'
    },
    showbuttons: false,
    url: `${api + dataForm}/${_caller}`,
    params: { name: 'status', category: _caller }
  });

  $('#dataDescription a').editable({
    ajaxOptions: {
      type: 'put',
      dataType: 'json'
    },
    validate(value) {
      if ($.trim(value) === '') return 'This field is required';
    },
    showbuttons: 'bottom',
    url: `${api + dataForm}/${_caller}`,
    params: { name: 'description', category: _caller }
  });
}

function deleteRow(_id) {
  const _path = $('.linkactive').data('api');
  const _url = `${api + _path}/${_id}`;
  
  axios({
    url: _url,
    method: 'delete',
    headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') },
  })
    .then((response) => {
      if (response.data.success) {
        let tblRow = $('#tr' + response.data.id);
        $('.modal').modal('hide');
        oTable.row(tblRow).remove().draw();
        Notify(GIS.toastType.Success, response.data.message);
      } else {
        Notify(GIS.toastType.Error, response.data.message);
      }
    })
    .catch((error) => {
      Notify(GIS.toastType.Error, error.response.data.message);
    });
}

$(document).ready(() => {
  $.ajaxSetup({
    headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
  });
  
  function toTitleCase(str) {
    str = $.trim(str);
    if (str.indexOf(':') !== -1) {
      str = str.split(":");
      str = str[1];
    }
    str = str.replace('_', ' ');
    str = str.toLowerCase().replace('user', 'created by');
    return str.replace(/(?:^|\s)\w/g, match => match.toUpperCase());
  }

  function handleRequest(_method, _url, _data) {
    // Send a POST request
    axios({
      url: _url,
      data: _data,
      method: _method,
      headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') },
    })
      .then((response) => {
        if (response.data.success) {
          let rowNode = [];
          const _category = $('.linkactive').text();
          Notify(GIS.toastType.Success, response.data.message);

          // Populate Table Body
          jsonObj = response.data.data;

          if (_category.toLowerCase() === 'lga') {
            rowNode = [
              `<td><a href="#" onclick="deleteRow(${jsonObj.id});" class="delete btn btn-default btn-danger"><i class="glyphicon glyphicon-trash"></i></a> ${jsonObj.id} </td>`,
              `<td><img src="${jsonObj.flag}" alt="${toTitleCase(json.country)}'s Flag" title="${toTitleCase(json.country)}'s Flag" class="img-responsive" style="width:32px; height:32px;" /></td>`,
              `<td nowrap>${toTitleCase(json.continent)}</td>`,
              `<td nowrap>${toTitleCase(json.country)}</td>`,
              `<td nowrap>${toTitleCase(json.state)}</td>`,
              `<td nowrap>${toTitleCase(json.lga)}</td>`,
              `<td nowrap>${toTitleCase(json.area)}</td>`,
              `<td id="dataStatus"><a id="st${jsonObj.id}" href="#" style="color:blue;" data-type="radiolist" data-title="Set Status" data-pk="${jsonObj.id}">${toTitleCase(jsonObj.status === true ? 'Active' : 'Inactive')}</a></td>`,
              `<td>${moment(jsonObj.created_at).format('dddd Do of MMMM YYYY hh:mm:ss')}</td>`,
              `<td nowrap>''</td>`
            ];
          } else {
            rowNode = [
              `<td><a href="#" onclick="deleteRow(${jsonObj.id});" class="delete btn btn-default btn-danger"><i class="glyphicon glyphicon-trash"></i></a> ${jsonObj.id} </td>`,
              `<td id="dataDescription"><a href="#" style="color:blue;" data-type="textarea" data-title="Edit Description" data-pk="${jsonObj.id}">${toTitleCase(jsonObj.description)}</a></td>`,
              `<td id="dataStatus"><a id="st${jsonObj.id}" href="#" style="color:blue;" data-type="radiolist" data-title="Set Status" data-pk="${jsonObj.id}">${toTitleCase(jsonObj.status === true ? 'Active' : 'Inactive')}</a></td>`,
              `<td>${moment(jsonObj.created_at).format('dddd Do of MMMM YYYY hh:mm:ss')}</td>`,
              ' '
              // `<td><a href="mailto:${value.email}?Subject=Hello%20again" target="_top" style="color:#01c0c8;">${toTitleCase(`${value.firstname} ${value.lastname}`)}</a></td>`
            ];
          }
          oTable.row
            .add(rowNode)
            .draw()
            .node();
          setEditables();
          $('.modal').modal('hide');          
        } else {
          Notify(GIS.toastType.Error, response.data.message);
        }
      })
      .catch((error) => {
        Notify(GIS.toastType.Error, error.response.message);
      });
  }

  $('.modal').on('show.bs.modal', function(event) {
    // Update the modal's content.
    var modal = $(this);
    const modalTitle = $('.linkactive').text();
    modal.find('.modal-title').text(`Setup ${modalTitle}.`);
    modal.find('#lblstatus').text(`${modalTitle} Status *`);

    if ($('#continent').length === 1) {
      getplaces(6295630, 'continent');
    }
  });

  $('.modal').on('hidden.bs.modal', () => {
    $('#description').val('');
    $('#activate').addClass('active');
    $('#deactivate').removeClass('active');
  });

  $('#btnMetaSave').on('click', () => {
    const _category = $('.linkactive').text();
    const _path = $('.linkactive').data('api');
    const _url = `${api + _path}/${_category}`;
    const _status = !!$('#activate').hasClass('active');

    if ($('#description').val() !== '') {
      const _data = { description: $('#description').val(), status: _status, category: _category };
      handleRequest('post', _url, _data);
    } else {
      Notify(GIS.toastType.Info, `${_category} description cannot be empty.`);
    }
  });

  $('#btnLgaSave').on('click', () => {
    const _category = $('.linkactive').text();
    const _path = $('.linkactive').data('api');
    const _url = `${api + _path}/${_category}`;

    const _data = {
      status: !!$('#activatelga').hasClass('active'),
      flag: $("#country option:selected").attr('flag'),
      area: $('#area').val() + ':' + $("#area option:selected").text(),
      state: $('#state').val() + ':' + $("#state option:selected").text(),
      country: $('#country').val() + ':' + $("#country option:selected").text(),
      lga: $('#lga_region').val() + ':' + $("#lga_region option:selected").text(),
      continent: $('#continent').val() + ':' + $("#continent option:selected").text()
    };

    handleRequest('post', _url, _data);
  });

  function createEmptyTable(tblTemplate) {
    const _caller = $('.linkactive').text();
    const dataForm = $('.linkactive').data('api');

    // Populate Table Headers
    tblTemplate += '<thead><tr><th> &nbsp; </th></tr></thead>';

    // Populate Table Body
    tblTemplate += '<tbody></tbody>';

    // Populate Table Footer
    tblTemplate += `<tfoot><tr><td> <button type="button" class="btn btn-info center" data-toggle="modal" data-target="#${dataForm}" data-caller="${_caller}">Register ${_caller}.</button> </td></tr></tfoot>`;
    tblTemplate += '</table>';

    $('#pgcontent').append(`<div class="col-sm-12 col-md-12">${tblTemplate}</div>`);
    oTable = $('#tblData').DataTable();
  }

  function createDataTable(jsonObj) {
    let _rowCount = 1;
    let tblData = '<table id="tblData" class="table table-striped table-bordered" style="width:100%; color: #999;">';

    if ($.isEmptyObject(jsonObj)) {
      createEmptyTable(tblData);
      return true;
    }

    const _keys = Object.keys(jsonObj[0]);
    const _caller = $('.linkactive').text();
    const dataForm = $('.linkactive').data('api');

    // Populate Table Headers
    tblData += '<thead><tr>';
    tblData += '<th> # </th>';
    for (const j in _keys) {
      if (excludeKeys.indexOf(_keys[j]) === -1) {
        _rowCount += 1;
        tblData += `<th>${toTitleCase(_keys[j])}</th>`;
      }
    }
    tblData += '</tr></thead>';

    // Populate Table Body
    tblData += '<tbody>';
    $.each(jsonObj, function (index, object) {
      tblData += `<tr id='tr${this.id}' rowid='tr${this.id}'>`;
      tblData += `<td><a href="#" onclick="deleteRow(${this.id});" class="delete btn btn-default btn-danger"><i class="glyphicon glyphicon-trash"></i></a> ${++index} </td>`;
      $.each(this, (key, value) => {
        if (excludeKeys.indexOf(key) === -1) {
          switch (key.toLowerCase()) {
            case 'status':
              tblData += `<td id="dataStatus"><a id="st${this.id}" href="#" style="color:blue;" data-type="radiolist" data-title="Set Status" data-pk="${this.id}">${toTitleCase(value === true ? 'Active' : 'Inactive')}</a></td>`;
              break;

            case 'description':
              tblData += `<td id="dataDescription"><a href="#" style="color:blue;" data-type="textarea" data-title="Edit Description" data-pk="${this.id}">${toTitleCase(value)}</a></td>`;
              break;

            case 'user':
              tblData += `<td><a href="mailto:${value.email}?Subject=Hello%20again" target="_top" style="color:#01c0c8;">${toTitleCase(`${value.firstname} ${value.lastname}`)}</a></td>`;
              break;
            case 'flag':
              tblData += `<td><img src="${value}" alt="${toTitleCase(object.country)}'s Flag" title="${toTitleCase(object.country)}'s Flag" class="img-responsive" style="width:32px; height:32px;" /></td>`;
              break;            
            case 'created_at':
            case 'updated_at':
              if (value == null) {
                tblData += '<td>&nbsp;</td>';
              } else {
                tblData += `<td>${moment(value).format('dddd Do of MMMM YYYY')}</td>`;
              }
              break;

            default:
              tblData += `<td nowrap>${toTitleCase(value)}</td>`;
              break;
          }
        }
      });
      tblData += '</tr>';
    });
    tblData += '</tbody>';

    // Populate Table Footer
    tblData += `<tfoot><tr><td colspan="${_rowCount}"> <button type="button" class="btn btn-info center" data-toggle="modal" data-target="#${dataForm}" data-caller="${_caller}">Register ${_caller}.</button> </td></tr></tfoot>`;
    tblData += '</table>';

    $('#pgcontent').append(`<div class="col-sm-12 col-md-12">${tblData}</div>`);
    oTable = $('#tblData').DataTable();
    // oTable.colReorder.order([0, 1, 2, 5, 3, 4]);
    setEditables();
  }

  function loadData(_url) {
    axios.get(_url)
      .then((response) => {
        if (response.data.success) {
          createDataTable(response.data.data);
        }
        // console.log(response.headers['x-access-token']);
      })
      .catch((error) => {
        Notify(GIS.toastType.Error, error.response.data.message);
      });
  }

  $('#navlinks').on('click', 'a', function (e) {
    e.preventDefault();
    $('#pgcontent').empty();
    const _category = $(this).text();
    const _apiPath = $(this).data('api');
    $('#pgHeader').html(`${_category} Setup.`);
    const _url = `${api + _apiPath}/${_category}`;

    $('#navlinks li a').filter(function () {
      $(this).removeClass('linkactive');
    });

    $(this).addClass('linkactive').parent().parent()
      .addClass('in')
      .parent();

    switch (_apiPath.toLowerCase()) {
      case 'primary':
        break;

      case 'secondary':
        break;

      default:
        loadData(_url);
        break;
    }
  });

});

(function ($) {
  const Radiolist = function (options) {
    this.init('radiolist', options, Radiolist.defaults);
  };
  $.fn.editableutils.inherit(Radiolist, $.fn.editabletypes.checklist);

  $.extend(Radiolist.prototype, {
    renderList() {
      let $label;
      this.$tpl.empty();
      if (!$.isArray(this.sourceData)) {
        return;
      }

      for (let i = 0; i < this.sourceData.length; i++) {
        $label = $('<label>', { class: this.sourceData[i].class, id: this.sourceData[i].text })
          .append($('<input>', { type: 'radio', name: this.options.name, value: this.sourceData[i].value }))
          .append($('<i> ', { class: this.sourceData[i].display }).text(`${this.sourceData[i].text}`));

        // Add radio buttons to template
        this.$tpl.append($label);

        $label.click((evt) => {
          const _id = evt.originalEvent.srcElement.offsetParent.parentElement.childNodes['0'].id;
          $(`#${_id}`).text(evt.target.innerText.toLowerCase() === ' activate' ? 'Active' : 'Inactive');
          // editable-submit
          // $('.editableform').editable().submit();

          const _caller = $('.linkactive').text();
          const dataForm = $('.linkactive').data('api');
          const _url = `${api + dataForm}/${_caller}`;
          const params = {
            name: 'status',
            category: _caller,
            pk: _id.replace(/st/gi, ''),
            value: evt.target.innerText.toLowerCase() === ' activate' ? true : false
          };

          // Send a PUT request
          axios({
            url: _url,
            data: params,
            method: 'put',
            headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') },
          })
            .then((response) => {
              if (response.data.success) {
                $('.editable-popup').hide();
                Notify(GIS.toastType.Success, response.data.message);
              }
            })
            .catch((error) => {
              Notify(GIS.toastType.Error, error.response.data.message);
            });
        });

        if (this.options.radiolist.linebreak) {
          this.$tpl.append('<br />');
        }
      }

      this.$input = this.$tpl.find('input[type="radio"]');
    },

    input2value() {
      return this.$input.filter(':checked').val();
    },
    str2value(str) {
      return str || null;
    },

    value2input(value) {
      this.$input.val([value]);
    },
    value2str(value) {
      return value || '';
    }
  });

  Radiolist.defaults = $.extend({}, $.fn.editabletypes.list.defaults, {
    /**
      @property tpl
      @default <div></div>
    * */
    tpl: '<div class="editable-radiolist" data-toggle="buttons"></div>',

    /**
     @property inputclass, attached to the <label> wrapper instead of the input element
      @type string
      @default null
    * */
    inputclass: '',
    radiolist: {
      linebreak: false
    },
    name: 'defaultname'
  });

  $.fn.editabletypes.radiolist = Radiolist;
}(window.jQuery));

// JSONscriptRequest -- a simple class for accessing Yahoo! Web Services
// using dynamically generated script tags and JSON
//
// Author: Jason Levitt
// Date: December 7th, 2005
//
// A SECURITY WARNING FROM DOUGLAS CROCKFORD:
// "The dynamic <script> tag hack suffers from a problem. It allows a page 
// to access data from any server in the web, which is really useful. 
// Unfortunately, the data is returned in the form of a script. That script 
// can deliver the data, but it runs with the same authority as scripts on 
// the base page, so it is able to steal cookies or misuse the authorization 
// of the user with the server. A rogue script can do destructive things to 
// the relationship between the user and the base server."
//
// So, be extremely cautious in your use of this script.
//

function getplaces(gid,src) {
  whos = src;
  var request = "http://www.geonames.org/childrenJSON?geonameId="+gid+"&callback=listPlaces&style=long";
  aObj = new JSONscriptRequest(request);
  aObj.buildScriptTag();
  aObj.addScriptTag();	
}

function listPlaces(jData) {
  counts = jData.geonames.length<jData.totalResultsCount ? jData.geonames.length : jData.totalResultsCount;
  who = document.getElementById(whos);
  who.options.length = 0;
  
  if (counts) { who.options[who.options.length] = new Option('Select', ''); }
  else { who.options[who.options.length] = new Option('No Data Available', 'NULL'); }
      
  for(var i=0;i<counts;i++) {
    let countryCode = jData.geonames[i].countryCode;
    let opt = new Option(jData.geonames[i].name, jData.geonames[i].geonameId);

    if (typeof countryCode !== 'undefined') {
      $(opt).attr('flag', `http://www.geonames.org/flags/x/${countryCode.toLowerCase()}.gif`);
    }
    who.options[who.options.length] = opt;
  }

  delete jData;
  jData = null		
}

// Constructor -- pass a REST request URL to the constructor
function JSONscriptRequest(fullUrl) {
  // REST request path
  this.fullUrl = fullUrl; 
  // Keep IE from caching requests
  this.noCacheIE = '&noCacheIE=' + (new Date()).getTime();
  // Get the DOM location to put the script tag
  this.headLoc = document.getElementsByTagName("head").item(0);
  // Generate a unique script tag id
  this.scriptId = 'YJscriptId' + JSONscriptRequest.scriptCounter++;
}

// Static script ID counter
JSONscriptRequest.scriptCounter = 1;

// buildScriptTag method
JSONscriptRequest.prototype.buildScriptTag = function () {
  // Create the script tag
  this.scriptObj = document.createElement("script");
  
  // Add script object attributes
  this.scriptObj.setAttribute("type", "text/javascript");
  this.scriptObj.setAttribute("src", this.fullUrl + this.noCacheIE);
  this.scriptObj.setAttribute("id", this.scriptId);
}

// removeScriptTag method
JSONscriptRequest.prototype.removeScriptTag = function () {
  // Destroy the script tag
  this.headLoc.removeChild(this.scriptObj);  
}

// addScriptTag method
JSONscriptRequest.prototype.addScriptTag = function () {
  // Create the script tag
  this.headLoc.appendChild(this.scriptObj);
}
