## Note Manager

Link: https://a3-jdwalden74.glitch.me/

My website works as a virtual workspace to house all of your sticky notes. The app allows you to create, edit, and delete
custom sticky notes with titles, text areas, date tracking, and custom colors. It keeps an active count of all your sticky notes
and dynamically changes there color based on user input. It organizes your sticky notes for you and keeps them orderly
and ascetically pleasing.

I had a particularly hard time with the authentication with this application as I've never directly worked on it before,
but was able to overcome the challenge and keep a concurrent track of the current user in the server and client side.

I chose a simple track of username and password in my mongodb database as it was the easiest to implement. I then had 
every request include the current sessions user for authentication, as well as a route to retrieve the current sessions 
user to be stored on the client side. If you try to access the clipboard.html without being signed in it will kick you
back to the login. If you try to login and no username matches in the database it'll create a new account automatically.

I used 2 custom css stylesheets with a variety of custom identifiers. I attempted to use tailwind and Shadcn which I've used previously but
ran into issues as I believe they are primarily focused toward typescript / react.

## Technical Achievements
- **Tech Achievement 1**: I achieved 100's in all 4 categories of the lighthouse test on all pages of my application.
- Screenshots of both can be found in the "Screenshots" folder in my project directory.

