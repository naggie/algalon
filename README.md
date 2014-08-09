## Algalon is a web portal with monitoring features.

'Entities,' represented by 'widgets' are organised by categories as tabs.
Widgets have an initial 'state' which is then continually patched via
websockets. Tests, which run periodically or via interrupt, can change this
state. All entities with tests have a pass/fail/undefined state. These states
are aggregated to form the global health of the system. Entities can be defined
statically or produced dynamically by an 'enumerator.'

Entities consist of a server-side javascript class, a client-side javascript
class, and some CSS classes. There is currently no packaging system for this,
but this is planned.

Currently available entities:

1. `Saas`: Software as a service: will test a HTTP based service for a 200
   response optionally containing a fingerprint. Checks for any other response
   code, a timeout, or incorrect service.
2. `Hacker`: A Static profile of a user. Automatically generates gravatar URL.
   Could be replaced with an LDAP or discourse enumerator.
3. `Server`: A monitoring widget similar to MLDASH, except the servers each run
   a tiny RESTful webserver. The module works in a similar way to `Saas` but
   also monitors CPU usage, temperature, RAM usage, Disk usage etc.

Planned enumerators:

1. Github organisations for `Hacker`s
2. Discourse `Hacker`s
3. nmap scan of host
