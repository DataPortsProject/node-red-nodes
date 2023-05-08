
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
    function ListDatasetsNode(config) {
        RED.nodes.createNode(this,config);

        var node = this;

        // Get the parameters introduced by the user on the Frontend
        this.username = config.username;
        this.password = config.password;
        
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
            

            // Function to request the Datasets List from AMTE 

            async function getDatasetsList(token) {
                try {
                    const response = await axios({
                        method: 'GET',
                        url: 'http://amte.dataports-project.eu/api/datasets',
                        headers: {
                            'Authorization': 'Bearer ' + token
                           },
                    });
                    
                    return response.data

                } catch (err) {
                    console.error(err);
                }
            };


            // MAIN 

            getTokenKeycloack().then(token => {
                getDatasetsList(token).then(datasetsList => {
                    console.log(datasetsList)
                    msg.payload = JSON.stringify(datasetsList)
                    this.send(msg)
                })    
            })
        });
    }
    RED.nodes.registerType("list-datasets",ListDatasetsNode);
}


