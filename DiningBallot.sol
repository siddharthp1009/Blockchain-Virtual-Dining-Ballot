pragma solidity ^0.5.0;
contract DiningBallot {

    struct Voter {
        uint weight;
        bool voted;
        uint8 vote;
        uint8 year;
        uint8 degree;
        uint8 role;   // 8 for student and 9 for employee
        uint8 ubIt;
        uint8 votingChance;
        bool registered;
    }

    struct Proposal {
        uint voteCount;
    }

    struct Candidate {
        uint id;
        bool applied;
        uint8 _apply;
        uint candidate_weight;
    }

    address chairperson;
    mapping(address => Candidate) candidates;
    mapping(uint => Candidate) candidateList;
    mapping(address => Voter) voters;
    uint8  candidateCount;
    uint8  voterCount;

    Proposal[] proposals;


    enum Phase {Init,Regs,Vote, Done}

    Phase public state = Phase.Done;

    // Modifiers for chairperson

   modifier validPhase(Phase reqPhase)
    { require(state == reqPhase, "Not a valid phase");
      _;
    }
    modifier onlyChair()
     {require(msg.sender == chairperson, "Only chairperson can perform this action");
      _;
     }



     // Modifiers to apply for candidacy

     modifier isFDAapproved(bool FDA){
         require(FDA == true, "Your dining center must be FDA approved");
         _;
     }

     modifier UBfoodPermit(bool UBpermit){
         require(UBpermit == true, "Your dining center must be approved by UB");
         _;
     }

     modifier monthsOfExperience(uint8 n){
         require(n > 40, "Your dining center must have an experience of at least 40 months");
         _;
     }

     modifier weeklyHours(uint8 hrs){
         require(hrs > 30, "Your dining center must serve for at least 30 hours a week");
         _;
     }

     // Modifiers to register for voting

     modifier checkRole(uint _role){
         require(_role==8 || _role==9,"Invalid Role");
         _;
     }

     modifier onlyVoter()
     {require(!(msg.sender == chairperson),"Chairperson are not entitled for any voter roles!");
      _;
     }


    constructor () public  {
        chairperson = msg.sender;
        voters[chairperson].weight = 2; // weight 2 for testing purposes
       // proposals.length = numProposals;
        state = Phase.Regs;

        // For testing purposes
        // registerCandidate(0x03130a79e072A2e829E96f753d45e3F7767bB600, true, true, 45 , 35);
        // registerCandidate(0xAB87653eCFeBBBEd81A96018a23a24bB4C52D83c, true, true, 45 , 35);


    }

    function changeState(Phase x) public{

        require (x > state, "");
        state = x;
     }

    // This function accepts the following parameters when someone wants to register as a voter.
    // This function can only be accessed by a registered voter.

    function registerVoter(address voter, uint8 UBIT_number,uint8  _role) public validPhase(Phase.Regs){

        require (! voters[voter].voted, "You have already voted");
        require(!voters[voter].registered,"Voter Already Registered!");
        approveVoter(voter, UBIT_number,_role);

    }

    // approveVoter is called when a voter registers himself/herself. It checks if the information provided is correct and
    // classifies the voter as either a student or an employee.
    // A person can register as a voter only once.

    function approveVoter(address voter, uint8 UBIT_number, uint8  _role) private validPhase(Phase.Regs) checkRole(_role){


        if (UBIT_number > 0){

            if(_role == 8){
                voters[voter].weight = 1; //weigh students as 1 for voter
                voters[voter].voted = false;
                voters[voter].role = _role;
                voters[voter].ubIt = UBIT_number;
                voters[voter].registered = true;
                voterCount++;
            } else if(_role == 9) {
                voters[voter].weight = 1; //weigh employees as 1 for voter
                voters[voter].voted = false;
                voters[voter].role = _role;
                voters[voter].ubIt = UBIT_number;
                voters[voter].registered = true;
                voterCount++;
            }
        }else{
            require(UBIT_number > 0, "You need to be a UB student or Employee");
        }

    }

    // myData function can be accessed only by the voter to check his/her personal data.
    // address voterAddress,uint8 role,uint8 UBIT
    function myData() view public onlyVoter returns (uint8,bool,uint8,uint8,uint8,uint8,uint8) {
        Voter memory sender = voters[msg.sender];
        return (sender.ubIt,sender.voted,sender.year,sender.degree,sender.role,sender.vote, sender.votingChance);


    }

    // Function registerCandidate is used to register a candidate. It is a public function which can be accessed by everyone.
    // This function calls a number of modifiers to check if the dining center is FDA and UB approved, the years of experience
    // weekly hours and similar parameters.
    ////validPhase(Phase.Regs) isFDAapproved(FDA) UBfoodPermit(UBpermit) monthsOfExperience(monthsofexp) weeklyHours(hrs)
    function registerCandidate(address candidate, bool FDA, bool UBpermit, uint8 monthsofexp, uint8 hrs) public validPhase(Phase.Regs) isFDAapproved(FDA) UBfoodPermit(UBpermit) monthsOfExperience(monthsofexp) weeklyHours(hrs){
        candidateCount++;
        require(!candidates[candidate].applied,"Already Applied for candidacy");
        candidates[candidate].id = candidateCount;
        candidates[candidate].candidate_weight = 3;
        candidates[candidate].applied = true;
        candidateList[candidateCount] = Candidate(candidateCount,true,0,3);
        proposals.length = candidateCount + 1;
    }

    // This function is a public function that can be accessed by everyone. A person can vote for multiple candidates.
    function vote(uint8 toProposal) public { //validPhase(Phase.Vote) {

        Voter memory sender = voters[msg.sender];
        //require(voters[msg.sender].ubIt > 0,"Unregistered user");
        require (!sender.voted);
        require (toProposal <= candidateCount, "No such candidate");

        voters[msg.sender].voted = true;
        voters[msg.sender].vote = toProposal;
        voters[msg.sender].votingChance++;
        proposals[toProposal].voteCount += 1;
    }


    // This function can be accessed only by a voter to change his/her vote. It requires the voter to already have voted.
    // When a voter calls this function and mentions a new candidate to vote for, this function deletes his/her previous vote
    // and increments vote count for the other specified candidate.
    function changeVote(uint8 toProposal) public { //validPhase(Phase.Vote) onlyVoter {
        Voter memory sender = voters[msg.sender];
        require (sender.voted, "You haven't voted yet");
        require (toProposal <= candidateCount, "No such candidate");
        require(sender.votingChance!=2, "You have exhausted your chances to vote!");
        voters[msg.sender].voted = true;
        proposals[sender.vote].voteCount -=1;
        voters[msg.sender].vote = toProposal;
        voters[msg.sender].votingChance++;
        proposals[toProposal].voteCount += 1;
    }
    // This function can be accessed by everyone. It accepts the candidate address as a parameter and
    // displays the specified candidate information.
    function displayCandidateDetails(address candidateAddress) public view returns (uint,bool,uint8,uint) {

        return (candidates[candidateAddress].id, candidates[candidateAddress].applied,candidates[candidateAddress]._apply,candidates[candidateAddress].candidate_weight);

    }
    // This function is similar to the above function. In this function, candidate information can be accessed by ID
    // instead of their address.
     function displayCandidates(uint candidateID) public view returns (uint,bool,uint8,uint)  {

       return (candidateList[candidateID].id, candidateList[candidateID].applied,candidateList[candidateID]._apply,candidateList[candidateID].candidate_weight);
    // returns id, registrerd?,
    }

    // Returns total number of voters in the blockchain and can be accessed by the chairperson only.
     function getVoterCount() public view returns (uint8){
       return voterCount;
    }

    // Returns total number of candidates and can be viewed by everyone.
    function getCandidateCount() public view returns (uint8){
       return candidateCount;
    }

    // This function tallies all the votes and is used to declare winner. It can be accessed by everyone.
    // This function can be called only when the chairperson changes the phase to Phase.done, that is, when voting phase is complete.
    function reqWinner() public validPhase(Phase.Done) view returns (uint8 winningProposal) {
        uint256 winningVoteCount = 0;
        for (uint8 prop = 0; prop < proposals.length; prop++)
            if (proposals[prop].voteCount > winningVoteCount) {
                winningVoteCount = proposals[prop].voteCount;
                winningProposal = prop;
            }
       //assert(winningVoteCount>=1);
        return winningProposal;
    }
}