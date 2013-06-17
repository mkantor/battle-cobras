The game server can be run with Vagrant.

If you're not familiar with Vagrant, read more about it at http://www.vagrantup.com.

Installers for VirtualBox are available at http://www.virtualbox.org, and installers for
Vagrant are available at http://www.vagrantup.com.

Once you have the pre-requisites installed, you should be able to clone this repository

    git clone https://github.com/mkantor/battle-cobras.git battle-cobras

and change to your new project directory to start your VM:

    cd battle-cobras
    vagrant up

Note that the Vagrantfile will download and install the precise32 vagrant box if you don't
already have it.

After a few minutes, you should have a virtual dev environment containing the game server and all
of its dependencies. The app folder is shared, and port 80 on the VM is forwarded to port 3000 on
the localhost. This is all customizable in the Vagrantfile.

You can test out your environment by ssh'ing into your environment and running the sample script:

    vagrant ssh
    cd app
    sudo node server.js

Next open localhost:3000 in your web browser. If everything worked correctly, you should see
the game.