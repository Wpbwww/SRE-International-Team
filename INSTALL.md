# Installation instructions

## Acquiring the project

The software is available at [Wpbwww/SRE-International-Team (github.com)](https://github.com/Wpbwww/SRE-International-Team). The project can either be cloned through GitHub, or a ZIP file can be downloaded as well.

Once the project has been downloaded, navigate to the folder containing it (if downloading a ZIP, unzip it in a place of your choosing).

## Setting up MongoDB

In order to be able to open and analyze repositories, a MongoDB database needs to be created first. Navigate into your MongoDB compass, an create a database with the name 'double-c'. Otherwise, this program will not be able to run.

## Setting up the project
Should you encounter an error, please refer to our Error Troubleshooting section.

After opening the project folder, navigate to it in the command line (on windows, you can right click the project folder to get its address as text, which you can then use in the terminal):
![image info](./pictures/command_line.png)

Next, use the 'npm run install-dependencies' command to install all the tools required by the software:
![image info](./pictures/install_dependencies.png)
After installation finishes, your output should look something like:
![image info](./pictures/install_dependencies_result.png)

After installing the dependencies, execute 'npm run server' to set up a server for the project, assuming all dependencies were installed successfully, the terminal output should look like this:
![image info](./pictures/run_server_result.png)

Next, open a new terminal window (do not close the first one), and navigate to the project folder. Then, use the 'npm run client' command to set up the frontend side of the software. After running the command, the second terminal should look something this:
![image info](./pictures/run_client_result.png)

In addition, the default browser on your computer should automatically open your localhost connection, and enter the website.

## Navigating the Site

To test out the site's functionality, try importing a repository by pressing the import button:
![image info](./pictures/import_repo.png)

Try to import the 'Pytorch' github repository:
![image info](./pictures/owner_name.png)

For any repository, you can get their import owner and name by looking at the link: github.com/owner/reponame.

After pressing OK, the system will start importing the relevant data, this process may take a while, as long as the load wheel is spinning there is no problem. After a few minutes, you can see your new project, and entering it will allow you to look at the repository analysis:

![image info](./pictures/repo.png)
![image info](./pictures/analysis.png)

Once inside the analysis window, you can select the time slice you want to analyse, the repository version you would like to analyse, and so on!


## Compatibility Description

 At present, the installation of automatic decompression and compilation of installation packages is not supported. It only supports downloading and decompressing compressed packages on github, and running the project in IDE environment that supports Node.JS.

## Release Notes

The detailed update log of each version can be found on GitHub.

## Error Troubleshooting
### Error 1: Cannot read properties of null (reading 'pickAlgorithm'), or similar disclaimers during execution of 'npm run install-dependencies'
![image info](./pictures/ERR_pickAlgo.png)

If during installation of dependencies you run into this error, follow these steps:
1. Using terminal, navigate to the project folder (the same folder where you executed the install-dependencies)
1. Execute the following command: 'npm cache clear --force'
1. Using terminal, navigate to the backend side of the project (use 'cd backend' if already in the project folder)
1. Execute the following command: 'npm cache clear --force'
1. Using terminal, navigate to the client side of the project (use 'cd client' if already in the project folder)
1. Execute the following command: 'npm cache clear --force'

These steps should clear the node cache for the whole project, executing 'npm run install-dependencies' now should lead to no errors. Remember to execute 'npm run install-dependencies' again, otherwise the dependencies will not be installed.

### Error 2: an error occurs when importing a repository on the website

If during importing a project, the system immediately stops loading, and shows a red error message, it may be the case that the github authenticator key has switched. authenticator key allows for faster loading of data, however sometimes the key may expire/not work on your machine.

To remedy this, you will need to create your own GitHub authentication token. For steps on how to create one, please refer to  [this website](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token#creating-a-personal-access-token-classic). Create a classic token, for scope access you do not need to give the token access to anything. In the end, you will be left with a long string which you should copy:

![image info](./pictures/auth_token.png)

Then, navigate to projectfolder/backend/controllers/dash.js. There, find the 'const octokit' variable, and switch the old auth token with your new one (the variable is located somewhere around line 10):
![image info](./pictures/octokit.png)

The nature of why some auth tokens expire early is unknown to us, the default auth key in our program should function for 90 days since the writing of this guide (until 16th of march), however it may be deleted prematurely.
