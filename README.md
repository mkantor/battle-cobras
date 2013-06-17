The game server can be run with Vagrant.

If you're not familiar with Vagrant, read more about it at 
http://www.vagrantup.com.

To start a VM for the game server:

    git clone https://github.com/mkantor/battle-cobras.git battle-cobras
    cd battle-cobras
    vagrant up

After a few minutes, you should have a virtual dev environment containing the 
game server and all of its dependencies. The app folder is shared, and port 80 
on the VM is forwarded to port 3000 on the localhost. This is all customizable 
in the Vagrantfile.

To run the server, ssh into your environment and start it with node:

    vagrant ssh
    cd app
    sudo node server.js

Next open localhost:3000 in your web browser. If everything worked correctly, 
you should see the game.