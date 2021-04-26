#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
# 

# This is a collection of bash functions used by different scripts

source scriptUtils.sh

export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export PEER1_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer1.org1.example.com/tls/ca.crt
export PEER2_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer2.org1.example.com/tls/ca.crt
export PEER3_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer3.org1.example.com/tls/ca.crt
export PEER4_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer4.org1.example.com/tls/ca.crt
export PEER5_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer5.org1.example.com/tls/ca.crt
export PEER6_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer6.org1.example.com/tls/ca.crt
export PEER7_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer7.org1.example.com/tls/ca.crt
export PEER8_ORG1_CA=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer8.org1.example.com/tls/ca.crt



export PEER0_ORG2_CA=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export PEER0_ORG3_CA=${PWD}/organizations/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt

# Set OrdererOrg.Admin globals
setOrdererGlobals() {
  export CORE_PEER_LOCALMSPID="OrdererMSP"
  export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
  export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/ordererOrganizations/example.com/users/Admin@example.com/msp
}

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  local PEER=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
 
  infoln "Using organization ${USING_ORG}"

  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    if [ PEER="0" ]; then
      export CORE_PEER_ADDRESS=peer0.org1.example.com:7051
      export CORE_PEER_ADDRESS=localhost:7051 
    elif [ PEER="1" ]; then
      export CORE_PEER_ADDRESS=peer1.org1.example.com:8051
      export CORE_PEER_ADDRESS=localhost:8051 
    elif [ PEER="2" ]; then
      export CORE_PEER_ADDRESS=peer2.org1.example.com:11051
      export CORE_PEER_ADDRESS=localhost:11051 
    elif [ PEER="3" ]; then
      export CORE_PEER_ADDRESS=peer3.org1.example.com:12051
      export CORE_PEER_ADDRESS=localhost:12051 
    elif [ PEER="4" ]; then
      export CORE_PEER_ADDRESS=peer4.org1.example.com:13051
      export CORE_PEER_ADDRESS=localhost:13051 
    elif [ PEER="5" ]; then
      export CORE_PEER_ADDRESS=peer5.org1.example.com:14051
      export CORE_PEER_ADDRESS=localhost:14051 
    elif [ PEER="6" ]; then
      export CORE_PEER_ADDRESS=peer6.org1.example.com:15051
      export CORE_PEER_ADDRESS=localhost:15051 
    elif [ PEER="7" ]; then
      export CORE_PEER_ADDRESS=peer7.org1.example.com:16051
      export CORE_PEER_ADDRESS=localhost:16051 
    elif [ PEER="8" ]; then
      export CORE_PEER_ADDRESS=peer8.org1.example.com:17051
      export CORE_PEER_ADDRESS=localhost:17051 


    else
      echo "NO MORE PEERS"
    fi
   




  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051


  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" == "true" ]; then
    env | grep CORE
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {

  PEER_CONN_PARMS=""
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    for PEER in 0 1 2 3 4 5 6 7 8 9
    do
      if [ PEER="0" ]; then
        PEER="peer0.org$1"
      elif [ PEER="1" ]; then
        PEER="peer1.org$1"
      elif [ PEER="2" ]; then
        PEER="peer2.org$1"
      elif [ PEER="3" ]; then
        PEER="peer3.org$1"
      elif [ PEER="4" ]; then
        PEER="peer4.org$1"
      elif [ PEER="5" ]; then
        PEER="peer5.org$1"
      elif [ PEER="6" ]; then
        PEER="peer6.org$1"
      elif [ PEER="7" ]; then
        PEER="peer7.org$1"
      elif [ PEER="8" ]; then
        PEER="peer8.org$1"
   
            
      else
        echo "NO MORE PEERS"
      fi
    done
     
    ## Set peer addresses
    PEERS="$PEERS $PEER"
    PEER_CONN_PARMS="$PEER_CONN_PARMS --peerAddresses $CORE_PEER_ADDRESS"
    ## Set path to TLS certificate
    TLSINFO=$(eval echo "--tlsRootCertFiles \$PEER0_ORG$1_CA")
    PEER_CONN_PARMS="$PEER_CONN_PARMS $TLSINFO"
    # shift by one to get to the next organization
    shift
  done
  # remove leading space for output
  PEERS="$(echo -e "$PEERS" | sed -e 's/^[[:space:]]*//')"
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}
