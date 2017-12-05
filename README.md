ActiveDirectory for Node-RED
=========

node-red-contrib-activedirectory is a [Node-RED](https://nodered.org/) nodes collection for Microsoft Active Directory. It is based on the [activedirectory2](https://www.npmjs.com/package/activedirectory2) ldapjs client for auth (authentication) and authZ (authorization) for Microsoft Active Directory (documentation [here](https://www.npmjs.com/package/activedirectory2)).

Getting started
--------------

+ Install Node-RED ([more](https://nodered.org/docs/getting-started/installation)):
```sh
sudo npm install -g node-red
```
+ Go to your node-RED conf directory (basically `~/node-red`)
```sh
npm install node-red-contrib-activedirectory
```
+ There you go! You can run Node-RED with:
```sh
node-red
```

Documentation
--------------
+ [Connection](#connection)
+ [findUser](#finduser)
+ [query](#query)
+ [examples](https://github.com/NoeSamaille/node-red-contrib-activedirectory/wiki/Examples)

---------------------------------------

<a id="connection"></a>
### Connection

Every node requires LDAP configuration/credentials to create an instance of the client configured according to the following options:
+ `url` {string}: Active Directory server to connect to, e.g. `ldap://ad.example.com`.
+ `[baseDN]` {string}: Optional, The root DN from which all searches will be performed, e.g. `dc=example,dc=com`.
+ `username` {string}: An account name capable of performing the operations desired.
+ `password` {string}: Password for the given `username`.

![image of node credentials](https://github.com/NoeSamaille/node-red-contrib-activedirectory/blob/master/images/node_credentials.png)

<a id="finduser"></a>
### findUser

![image of node finduser](https://github.com/NoeSamaille/node-red-contrib-activedirectory/blob/master/images/node_finduser.png)

Connects to a Microsoft Active Directory and returns the user corresponding to the username set in `msg.payload`.

__Inputs__

+ `msg.payload`: _string_, the AD username of the user we want to get information. It also works with DN.
+ `msg.ad_attributes`: _JSON Object_, the attributes we want to return for users and groups. By default, if not set, the following attributes are returned for users and groups:
  + user: 
    + distinguishedName
    + userPrincipalName
    + sAMAccountName
    + mail
    + lockoutTime
    + whenCreated
    + pwdLastSet
    + userAccountControl
    + employeeID
    + sn
    + givenName
    + initials
    + cn
    + displayName
    + comment
    + description
    + group:
    + distinguishedName
    + objectCategory
    + cn
    + description

__Outputs__

+ `msg.payload`: _JSON Object_, the standard output of the command, a JSON object that contains all the information about the user.

<a id="query"></a>
### query

![image of node query](https://github.com/NoeSamaille/node-red-contrib-activedirectory/blob/master/images/node_query.png)

Connects to a Microsoft Active Directory and returns the result of the AD query input set in `msg.payload`.

__Inputs__
+ `msg.payload`: _string_, an LDAP query (more information: [LDAP query basics](https://technet.microsoft.com/en-us/library/aa996205(v=exchg.65).aspx)).
+ `msg.ad_attributes`: _JSON Object_, the attributes we want to return for users and groups. By default, if not set, the following attributes are returned for users and groups:
  + user: 
    + distinguishedName
    + userPrincipalName
    + sAMAccountName
    + mail
    + lockoutTime
    + whenCreated
    + pwdLastSet
    + userAccountControl
    + employeeID
    + sn
    + givenName
    + initials
    + cn
    + displayName
    + comment
    + description
  + group:
    + distinguishedName
    + objectCategory
    + cn
    + description

__Outputs__

+ `msg.payload`: _JSON Object_, the standard output of the command, a JSON object that contains result of the AD query input.