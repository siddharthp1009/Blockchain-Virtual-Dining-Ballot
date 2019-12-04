var CandidateNumber = 0;
//var candidateInfo = [];
App = {
  web3Provider: null,
  contracts: {},
  names: new Array(),
  url: 'http://127.0.0.1:7545',
  chairPerson: null,
  candidateInfo : [],
  currentAccount: null,
  init: function () {
    return App.initWeb3();
  },

  initWeb3: function () {
    // Is there is an injected web3 instance?
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fallback to the TestRPC
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    web3 = new Web3(App.web3Provider);

    ethereum.enable();

    ethereum.autoRefreshOnNetworkChange = false;
    //App.populateAddress();
    return App.initContract();
  },

  initContract: function () {
    $.getJSON('DiningBallot.json', function (data) {

      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var voteArtifact = data;
      App.contracts.vote = TruffleContract(voteArtifact);

      // Set the provider for our contract
      App.contracts.vote.setProvider(App.web3Provider);
      //alert(jQuery.fn.jquery);
      App.getChairperson();
      return App.bindEvents();
    });
  },

  bindEvents: function () {
    $(document).on('click', '#RegCandidate', function () {
      event.preventDefault()
      var name = $('#enter_name').val();
      App.candidateInfo.push(name)
      var addressC = $('#enter_address').val();
      var FDA = $('#enter_FDA').val();
      var UBPermit = $('#enter_UBPermit').val();
      var Months = $('#enter_months').val();
      var Hours = $('#enter_hours').val();
      //alert(addressC, FDA, UBPermit, Months, Hours)
      App.handleCandidateRegistration(addressC, FDA, UBPermit, Months, Hours);
    });
    //$("#test-element").click(function() {
    $("#RegVoter").click(function () {
      event.preventDefault()
      var addressV = $('#enter_addressV').val();
      var UBIT = $('#enter_UBIT').val();
      var role = $('#enter_role').val();
      console.log("registered");
      App.handleVoterRegistration(addressV, UBIT, role);
    });

    //$(document).on('click', '#RegVoter', App.foo());
    $(document).on('click', '#Vote', function () {
      event.preventDefault()
      var CandidateID = $('#enter_id').val();
      App.handleVote(CandidateID);
    })
    $(document).on('click', '#getVoterCount', function(){
      event.preventDefault();
      App.handleVoterCount();
    })
    $(document).on('click', '#ChangeVote', function () {
      event.preventDefault()
      var CandidateID = $('#enter_id').val();
      App.handleChangeVote(CandidateID);
    })
    $(document).on('click', '#CandidateCount', function () {
      event.preventDefault()
      App.handleCandidateCount();
    })
    $(document).on('click', '#DisplayCandidates', function () {
      event.preventDefault()
      var CandidateID = $('#enter_id').val()
      App.handleDisplayCandidates(CandidateID);
    })
    $(document).on('click', '#changeState', function () {
      event.preventDefault()
      var x = $('#enter_state').val()
      App.handleState(x)
    })


    $(document).on('click', '#ReqWinner', App.handleWinner);

  },

  getChairperson: function () {
    App.contracts.vote.deployed().then(function (instance) {
      return instance;
    }).then(function (result) {
      App.chairPerson = result.constructor.currentProvider.selectedAddress.toString();
      App.currentAccount = web3.eth.coinbase;
      // if (App.chairPerson != App.currentAccount) {
      //   jQuery('#address_div').css('display', 'none');
      //   jQuery('#register_div').css('display', 'none');
      // } else {
      //   jQuery('#address_div').css('display', 'block');
      //   jQuery('#register_div').css('display', 'block');
      // }
    })
  },

  handleCandidateRegistration: function (addressC, FDA, UBPermit, Months, Hours) {

    var voteInstance;
    App.contracts.vote.deployed().then(function (instance) {
      voteInstance = instance;
      return voteInstance.registerCandidate(addressC, FDA, UBPermit, Months, Hours);
    }).then(function (result, err) {
      if (result) {
        if (parseInt(result.receipt.status) == 1) {
          CandidateNumber += 1;
          alert(" registration done successfully")
        }
        else {
          alert(" registration not done successfully due to revert")
        }
      } else {
        alert(err)
        alert(" registration failed")
      }
    });
  },

  handleVoterRegistration: function (addressV, UBIT, role) {
    var voteInstance;
    App.contracts.vote.deployed().then(function (instance) {
      voteInstance = instance;
      return voteInstance.registerVoter(addressV, UBIT, role);
    }).then(function (result, err) {

      if (result) {
        if (parseInt(result.receipt.status) == 1) {
          alert(" registration done successfully")
        }
        else {
          alert(" registration not done successfully due to revert")
        }
      } else {
        alert(" registration failed")
      }
    });
  },
  handleCandidateCount: function () {
    var voteInstance;
    App.contracts.vote.deployed().then(function (instance) {
      voteInstance = instance;
      return voteInstance.getCandidateCount();
    }).then(function (result) {
      $('#get_cand').text(result)
    }).catch(function (err) {
      alert(err.message)
    });
  },

  handleVoterCount : function (){
    var voteInstance;
    App.contracts.vote.deployed().then(function (instance) {
      voteInstance = instance;
      return voteInstance.getVoterCount();
    }).then(function (result) {
      $('#votercount').text(result)
    }).catch(function (err) {
      alert(err.message)
    });
  },

  handleVote: function (CandidateID) {
    //event.preventDefault();
    //var proposalId = parseInt($(event.target).data('id'));
    var voteInstance;

    web3.eth.getAccounts(function (error, accounts) {
      var account = accounts[0];
      App.contracts.vote.deployed().then(function (instance) {
        voteInstance = instance;
        return voteInstance.vote(CandidateID, { from: account });
        //return voteInstance.vote(CandidateID);
      }).then(function (result, err) {
        if (result) {
          console.log(result.receipt.status);
          if (parseInt(result.receipt.status) == 1)
            alert(account + " voting done successfully")
          else
            alert(account + " voting not done successfully due to revert")
        } else {
          alert(account + " voting failed")
        }
      });
    });
  },

  handleChangeVote: function (CandidateID) {
    //event.preventDefault();
    //var proposalId = parseInt($(event.target).data('id'));
    var voteInstance;

    web3.eth.getAccounts(function (error, accounts) {
      var account = accounts[0];

      App.contracts.vote.deployed().then(function (instance) {
        voteInstance = instance;

        return voteInstance.changeVote(CandidateID, { from: account });
      }).then(function (result, err) {
        if (result) {
          console.log(result.receipt.status);
          if (parseInt(result.receipt.status) == 1)
            alert(account + "Change voting done successfully")
          else
            alert(account + "Change voting not done successfully due to revert")
        } else {
          alert(account + "Change voting failed")
        }
      });
    });
  },

  handleDisplayCandidates: function (x) {
    var voteInstance;
    App.contracts.vote.deployed().then(function (instance) {
      voteInstance = instance;
      return voteInstance.displayCandidates(x);
    }).then(function (result) {
      var id = parseInt(result[0].valueOf(), 10)
      var name = App.candidateInfo[Object.keys(App.candidateInfo)[id - 1 ]]

      //var name = candidateInfo[id - 1]
      //alert(name)

      $("#c_id").text(id)
      $("#c_name").text(name)
      //alert(id + name)
    }).catch(function (err) {
      alert(err.message)
    });
  },
  handleWinner: function () {
    console.log("To get winner");
    var voteInstance;
    App.contracts.vote.deployed().then(function (instance) {
      voteInstance = instance;
      return voteInstance.reqWinner();
    }).then(function (res) {
      var id = parseInt(res.valueOf(), 10)
      var name = App.candidateInfo[Object.keys(App.candidateInfo)[id - 1 ]]

      //var name = candidateInfo[id - 1]
      $('#winner_id').text(name)
    }).catch(function (err) {
      console.log(err.message);
    })
  },

  handleState: function (x) {
    var voteInstance;
    App.contracts.vote.deployed().then(function (instance) {
      voteInstance = instance;
      return voteInstance.changeState(x);
    }).then(function (res) {
      console.log(res);
      alert("State changed to " + x);
    }).catch(function (err) {
      console.log(err.message);
    })
  }
};

$(function() {
  $(window).on('load',function() {
    App.init();
  });
});

