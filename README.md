## Algalon is a web portal with monitoring features.
![](http://callanbryant.co.uk/blog/images/saas.png)

'Testers,' represented by 'widgets' are organised by categories as tabs.
Widgets have an initial 'state' which is then continually patched via
websockets. Tests, which run periodically or via interrupt, can change this
state. All testers with tests have a pass/fail/undefined state. These states
are aggregated to form the global health of the system. Testers can be defined
statically or produced dynamically by an 'enumerator.'

![](http://callanbryant.co.uk/blog/images/d0559a7dd42e3241.png)

Testers consist of a server-side javascript class, using a client-side
javascript Widget, and some CSS classes. There is currently no packaging system
for this, but this is planned.

Natural dependencies will result in some failures cascading, which will reduce
the health further. Therefore, something severe will naturally have more weight
to it.

Currently available testers:

1. `HttpSaas`: Software as a service: will test a HTTP based service for a 200
   response optionally containing a fingerprint. Checks for any other response
   code, a timeout, or incorrect service.
2. `Hacker`: A Static profile of a user. Automatically generates gravatar URL.
   Could be replaced with an LDAP or discourse enumerator.
3. `Server`: A monitoring widget similar to MLDASH, except the servers each run
   a tiny RESTful webserver. The module works in a similar way to `Saas` but
   also monitors CPU usage, temperature, RAM usage, Disk usage etc.
4. `Ntp` : Asks the NTP server for a time, compares locally for within a 1000ms
5. `Dns` : Tries a DNS request, looks for 11 possible errors

Planned enumerators:

1. Github organisations for `Hacker`s
2. Discourse `Hacker`s
3. nmap scan of host
