// name: TTN V3 JSON processor
// outputs: 1
// initialize: // Code added here will be run once\n// whenever the node is started.\n
// finalize: // Code added here will be run when the\n// node is being stopped or re-deployed.\n
// info: 
var uplink_info = msg.payload['uplink_message'];
var dev_info = msg.payload['end_device_ids'];
var tags = {
            dev_id: dev_info['device_id'],
            app_name: dev_info['application_ids']['application_id'],
            dev_addr: dev_info['dev_addr'],
            dev_eui: dev_info['dev_eui'],
            network: 'ttn',
            bw_hz: uplink_info['settings']['data_rate']['lora']['bandwidth'],
            sf: uplink_info['settings']['data_rate']['lora']['spreading_factor'],
            coding_rate: uplink_info['settings']['coding_rate'],
            f_port: uplink_info['f_port']
        };

var measures = {
            ts: Date.parse(uplink_info['received_at']),
            lora_freq_hz: parseInt(uplink_info['settings']['frequency']),
            f_cnt: uplink_info['f_cnt'],
            airtime_s: parseFloat(uplink_info['consumed_airtime'].replace('s', ''))
            
        };
        
gw_object = uplink_info['rx_metadata'];


gw_object_sorted = gw_object.sort(function(a, b) {
    return parseFloat(b.rssi) - parseFloat(a.rssi);
});

// tags['gwobject'] = gw_object;
// tags['gwobjectsorted'] = gw_object_sorted;

// gw_object_sorted = gw_object.sort(function(a, b) {
//   return a.rssi - b.rssi;
// });

const gw_keys = Object.keys(gw_object_sorted);

var gw_cnt = 0;
for (var gw_key of gw_keys) {
    if (gw_object_sorted[gw_key].hasOwnProperty('packet_broker'))
        continue;
    gw_cnt += 1;
    tags['gw_' + gw_cnt + '_id'] = gw_object_sorted[gw_key]['gateway_ids']['gateway_id'];
    measures['gw_' + gw_cnt + '_rssi'] = gw_object_sorted[gw_key]['rssi'];
    measures['gw_' + gw_cnt + '_snr'] = gw_object_sorted[gw_key]['snr'];
    
}

// const keys = Object.keys(uplink_info['decoded_payload']);

// for (var key of keys) {
//     measures[key] = uplink_info['decoded_payload'][key];
// }

raw_payload = uplink_info['frm_payload'];
// function s(x) {return x.charCodeAt(0);}
// raw_payload = raw_payload.split('').map(s);

return { payload: 
    [
        measures,
        tags,
        raw_payload
    ]
};