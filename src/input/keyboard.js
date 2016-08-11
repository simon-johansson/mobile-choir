
import MIDIUtils from 'midiutils';
import $ from 'jquery';

const divInputs = document.getElementById('midi-inputs');
const activeInputs = {};
const activeOutputs = {};
let midiAccess;
let checkboxMIDIInOnChange;
let onInput;

export const init = (fn = null) => {
    onInput = fn;

    if(navigator.requestMIDIAccess !== undefined){
        navigator.requestMIDIAccess().then(

            function onFulfilled(access) {
                midiAccess = access;

                // create list of all currently connected MIDI devices
                showMIDIPorts();

                // update the device list when devices get connected, disconnected, opened or closed
                midiAccess.onstatechange = function(e){
                    $('#no-devices-found').hide();

                    let port = e.port;
                    let div = port.type === 'input' ? divInputs : void(0);
                    let listener = port.type === 'input' ? checkboxMIDIInOnChange : checkboxMIDIOutOnChange;
                    let activePorts = port.type === 'input' ? activeInputs : activeOutputs;
                    let checkbox = document.getElementById(port.type + port.id);
                    let label;

                    // device disconnected
                    if (port.state === 'disconnected') {
                        port.close();
                        label = checkbox.parentNode;
                        checkbox.nextSibling.nodeValue = port.name + ' (' + port.state + ', ' +  port.connection + ')';
                        checkbox.disabled = true;
                        checkbox.checked = false;
                        delete activePorts[port.type + port.id];

                    // new device connected
                    } else if(checkbox === null) {
                        label = document.createElement('label');
                        checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = port.type + port.id;
                        checkbox.addEventListener('change', listener, false);
                        label.appendChild(checkbox);
                        label.appendChild(document.createTextNode(port.name + ' (' + port.state + ', ' +  port.connection + ')'));
                        div.appendChild(label);
                        // div.appendChild(document.createElement('br'));

                    // device opened or closed
                    } else if(checkbox !== null) {
                        label = checkbox.parentNode;
                        checkbox.disabled = false;
                        checkbox.nextSibling.nodeValue = port.name + ' (' + port.state + ', ' +  port.connection + ')';
                    }
                };
            },
            function onRejected(e){
                divInputs.innerHTML = e.message;
            }
        );
    } else { // browsers without WebMIDI API or Jazz plugi
        divInputs.innerHTML = 'No access to MIDI devices: browser does not support WebMIDI API, please use the WebMIDIAPIShim together with the Jazz plugin';
    }
};

function showMIDIPorts(){
    let html;
    let checkbox;
    let checkboxes;
    let inputs, outputs;
    let i, maxi;

    // console.log('show');

    inputs = midiAccess.inputs;
    html = '<h4>midi inputs:</h4>';

    if (inputs.size) {
        inputs.forEach(function(port){
            //console.log('in', port.name, port.id);
            html += '<label><input type="checkbox" id="' + port.type + port.id + '">' + port.name + ' (' + port.state + ', ' +  port.connection + ')</label>';
        });
    } else {
        html += '<label id="no-devices-found">No midi devices found</label>';
    }

    divInputs.innerHTML = html;

    checkboxes = document.querySelectorAll('#midi-inputs input[type="checkbox"]');
    for (i = 0, maxi = checkboxes.length; i < maxi; i++) {
        checkbox = checkboxes[i];
        checkbox.addEventListener('change', checkboxMIDIInOnChange, false);
    }
}

// handle incoming MIDI messages
function inputListener(midimessageEvent){
    // var port, portId,
    const data = midimessageEvent.data;
    const type = data[0];
    const midi = data[1];
    const note = MIDIUtils.noteNumberToName(data[1]).split('-').join('');
    const data2 = data[2];
    const msg = {type, midi, note, data2};

    // console.log(msg);

    if (typeof onInput === 'function') {
        onInput(msg);
    }
}

checkboxMIDIInOnChange = function() {
    // port id is the same a the checkbox id
    var id = this.id;
    var port = midiAccess.inputs.get(id.replace('input', ''));
    if (this.checked === true){
        activeInputs[id] = port;
        // implicitly open port by adding an onmidimessage listener
        port.onmidimessage = inputListener;
    } else {
        delete activeInputs[id];
        port.close();
    }
};
