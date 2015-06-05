#!/bin/bash
if [ ! -d /opt/openhab ];then
	echo "Please create /opt/openhab with openhab files"
	exit 1
fi

cp ashasiscontroller /etc/init.d/
chmod +x /etc/init.d/ashasiscontroller
/usr/sbin/update-rc.d ashasiscontroller defaults

npm install
node prepare.js

apt-get install -y screen sudo
useradd -d /opt/openhab/ -M -s /bin/bash openhab
chown -R openhab:openhab /opt/openhab

cp openhab /etc/init.d/
chmod +x /etc/init.d/openhab
/usr/sbin/update-rc.d openhab defaults

cp 99-ashasisgw.rules /etc/udev/rules.d/
service udev restart
