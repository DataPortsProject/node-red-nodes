/**
 * DataPorts - A Data Platform for the Connection of Cognitive Ports
 * This project has received funding from the European Union’s Horizon 2020 research and innovation programme under grant agreement No 871493
 *
 * Copyright (C) 2020-2023, by (Author's company of this file):
 * - ITI – Instituto Tecnológico de Informática - Project Coordinator
 * - UNIVERSITAT POLITÈCNICA DE VALÈNCIA (UPV)
 *
 * For more information, contact:
 * Project coordinator:  <a href="mailto:info@dataports-project.eu"></a>
 *
 *
 *    This code is licensed under the ASL 2.0 license, available at the root
 *    application directory.
 */


const axios = require('axios');

module.exports = function(RED) {
    function ChangeStatusNode(config) {
        RED.nodes.createNode(this,config);

        var node = this;

        // Get the parameters introduced by the user on the Frontend
        this.username = config.username;
        this.password = config.password;
        this.servicename = config.servicename;
        this.status = config.status;
        
        this.on('input', function(msg) {
            
            // Function to request the Token from Keycloack 

            async function getTokenKeycloack() {
                try {
                    const response = await axios({
                        method: 'POST',
                        url: 'https://iam.dataports.com.es:8443/auth/realms/DataPorts/protocol/openid-connect/token',
                        headers: {
                            'Accept': ['application/json', 'text/plain', '*/*'],
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Authorization': 'Basic QXV0b21hdGljTW9kZWxzVHJhaW5pbmdFbmdpbmUyOmxIYndacDR2V2VpMkhNd2RBSkpiVlNjQmVpSHFUYWpB'
                           },
                        data: {
                            'username': node.username,
                            'password': node.password,
                            'grant_type': 'password'
                        }
                    });
                    
                    return response.data.access_token

                } catch (err) {
                    console.error(err);
                }
            };
            

            // Function to request the Data Retrieval from a specific service in AMTE 

            async function getData(token) {
                try {
                    const response = await axios({
                        method: 'POST',
                        url: 'http://amte.dataports-project.eu/api/service_change_status/',
                        headers: {
                            'Content-Type':'application/json',
                            // 'Authorization': 'Bearer ' + token
                           },
                        data: JSON.stringify({
                                "service": node.servicename,
                                'password': node.status,
                          })
                    });
                    
                    return response.data

                } catch (err) {
                    console.error(err);
                }
            };


            // MAIN 

            getTokenKeycloack().then(token => {
                getData(token).then(dataRetrieved => {
                    console.log(dataRetrieved)
                    msg.payload = JSON.stringify(dataRetrieved)
                    this.send(msg)
                })    
            })
        });
    }
    RED.nodes.registerType("change-status",ChangeStatusNode);
}


