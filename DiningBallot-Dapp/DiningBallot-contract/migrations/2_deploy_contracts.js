var Ballot = artifacts.require("DiningBallot.sol");

module.exports = function(deployer){
	deployer.deploy(Ballot);
}