

The project is developed in Visual Studio Code and is the recommended IDE for deploying the DiningBallot-app.


Steps to deploy and test the app - 

1. First, install truffle and make sure that a test chain on Ganache is running.

2. Navigate to DiningBallot-contract and type the following commands- 
	truffle compile
	truffle migrate --reset
   The above commands compile the smart contract code and deploy it on the test chain.

3. We need a number npm packages that support the entire UI structure such as bootstrap, Jquery, popper.js and many more which can be traced by package.json.
   Navigate to the DiningBallot-app directory and run the following command - 
	npm install
   
4. Then, navigate to the src directory and copy node_modules from the parent directory, that is, from DiningBallot-app to src.  

5. Once the packages are installed, we are good to deploy the app from the DiningBallot-app folder.

	DiningBallot-Dapp> DiningBallot-app : npm start


	Output for the above command would be:


		> ballot-dapp@1.0.0 start /DiningBallot-Dapp/DiningBallot-app
		> node index.js

		App listening on port 3000!

6. Once done with step 4, open google chrome (recommended for this project) and in the address bar, type - 

localhost:3000

The user should be able to see the homepage of the app and start exploring.


