## SQL Style/Convention Guide:

- Make sure to pass data. Do not concatenate strings or solely check for injection yourself.

- Datatypes other than VARCHARs exist. Use the appropriate data type and use the best possible size; not just the generic form because it's the easiest.

- If using quotes inside the command, escape with "\\". Don't use single quotes.

- Do not do more than one command in a query.

- Do not append semicolons to the command.

- Use capital letters in the commands ("SELECT * FROM USERS").

- Use lowerCamelCase for naming variables.
