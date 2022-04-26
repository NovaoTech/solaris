<script>
    import "@fontsource/plus-jakarta-sans";
</script>
<svelte:head>
    <title>Solaris - Learn to code, openly.</title>
</svelte:head>
<div id="wrapper">
    <h1>Solaris</h1>
    <h2>The open learn-to-code platform.</h2>
</div>

<style>
    @media only screen and (max-width: 700px) {
        h1 {
            font-size: calc(30vw - 40px);
        }
        h2 {
            font-size: calc(30vw / 7);
        }
    }
    @media only screen and (min-width: 700px) {
        h1 {
            font-size: calc(30vh - 40px);
        }
        h2 {
            font-size: calc(30vh / 7);
        }
    }
    h1 {
        font-family: 'Plus Jakarta Sans';
        font-weight: bolder;
        color: rgba(0,0,0, 1);
        padding: 20px;
    }
    h2 {
        font-family: 'Plus Jakarta Sans';
        color: rgba(0,0,0,.8);
        font-weight: bold;
        text-align: center;
        padding: 25;
    }
    #wrapper {
        height: 100vh;
        width: 100vw;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        background: rgb(255,156,0);
        background: linear-gradient(30deg, rgba(255,156,0,1) 30%, rgba(224,221,30,1) 100%); 
    }
</style>