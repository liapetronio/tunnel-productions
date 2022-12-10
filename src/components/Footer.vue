<template>
<footer>
    <!-- <div id="footer-wrapper"> -->
        <div class="row-justify">

            <div class="align-middle">
                <h4>Connect</h4>
                <ul class="no-bullet-ul">
                    <li><a id="contact-us_toggle-btn" class="" @click="toggleModal">Contact Us</a></li>
                    <li><a href="mailto:emailName@email.org">Email</a></li>
                    <li>Twitter<br>
                    </li>
                </ul>
            </div>
        </div>
    <!-- </div>     -->
    <b-modal ref="contact-us_modal" hide-footer title="">
        <div class="d-block text-center">
            <iframe class="contact-us_popup_form" src="https://docs.google.com/forms/d/e/1FAIpQLSf6SWeAmjZLD7WHKt1Pm36tX2vjGqQiyXymPpP2dlComG6nKw/viewform?embedded=true" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
        </div>
    </b-modal>
</footer>
</template>

<script>
export default {
    name: 'FooterComponent',
    methods: {
        toggleModal() {
            this.$refs['contact-us_modal'].toggle('#contact-us_toggle-btn')
        }
    }
}
</script>

<style scoped>
footer {
    background-color: #3b5db3;
    color: white !important;
    vertical-align:middle;
    padding:1rem 1rem 1rem 1rem;
    box-shadow:0 1px 6px 0 rgba(85, 151, 209, .2);
}
#footer-logo{
    width:200px;
    margin:0rem 1rem 3rem 0rem;
}
footer a{
    border-bottom:.5px solid white;
    color:white !important;
}
footer a:hover{
    opacity:0.8;
    border-bottom:.5px solid white;
}

ul {
  display: block;
  list-style-type: none;
  margin-block-start: 0em;
  margin-block-end: 0em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 0px;
}
h4{
    text-transform: uppercase;
}
@media screen and (min-width: 200px) and (max-width: 768px) {


   footer {
        padding:1.2rem 1rem 1rem 1rem;
        
    }
    #footer-logo{
        width:180px;
        margin:0rem 1rem 3rem 0rem;
    }

}
</style>