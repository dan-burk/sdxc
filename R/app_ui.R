###################################################
# sdxc, a Shiny app for chating with your data
# Author: Daniel Burkhalter    dburkhalter1500@gmail.com
# Sep. 7, 2024.
# No warranty and not for commercial use.
# Updated: Daniel Burkhalter    dburkhalter1500@gmail.com
###################################################


#' The application User-Interface
#'
#' @param request Internal parameter for `{shiny}`.
#'     DO NOT REMOVE.
#' @import shiny
#' @noRd
app_ui <- function(request) {
  tagList(
    golem_add_external_resources(),

    # Add color to UI
    tags$head(tags$style(HTML("
      /* navbar */
      .navbar {background-color: #BEE2E1;border-color: #000000; color: #181818;font-weight: bold;}

      /* tabs */
      .navbar-default .navbar-nav > li > a {background-color: #BEE2E1;
        border-color: #9AC596;color: #181818;font-size: 16px;}

      /* active tab */
      .navbar-default .navbar-nav > .active > a, .navbar-default .navbar-nav > .active > a:focus,
      .navbar-default .navbar-nav > .active > a:hover {background-color: #9EBBB7;color: #181818;font-weight: bold;}

      /* sidebar panel */
      .well {background-color: #BEE2E1;border-color: #000000;}

      /* selectInput & actionButton */
      .custom-select-input, .custom-action-button, .custom-download-button
      {font-size: 24px;color: #000;background-color: #BEE2E1;border-color: #000000;}

      /* selectInput extra customization */
      .selectize-input, .selectize-dropdown {background-color: #F6FFF5 !important;
        border-color: #000000 !important;color: #000 !important; font-size: 16px;}

      /* horizontal line (hr()) */
      .custom-hr{border-top: 1px solid #000000;}
      .custom-hr-thick{border-top: 3px solid #000000;}

      /* textarea, textInput, numericInput */
      textarea, input[type = 'text'], input[type='number']
      {width: 100%;background-color: #F6FFF5;border-color: #000000;font-size: 16px;}

      /* tippy this pop-ups */
      .tippy-content {font-size: 15px !important;}

      /* policy styles */
      .policy {background-color: #ededed;background-size: cover;background-position: center;
      min-height: 500px;margin: 0 !important;padding-top: 0px;display: flex;justify-content: center;
      border: 50px solid #bedbb7;color: #262626;text-align: left;flex-direction: column;}
      .policy h1 {font-size: 40px;padding-top: 90px;margin-left: 125px;font-weight: bold;}
      .policy h2 {font-size: 25px;padding-top: 40px;margin-left: 125px;font-weight: bold;}
      .policy h3 {font-size: 20px;padding-top: 20px;margin-left: 125px;font-weight: bold;}
      .policy p {font-size: 17px;margin-top: 20px;margin-right: 125px;margin-left: 125px;}

      body {padding-bottom: 50px;}
    "))),


    navbarPage(
      title = HTML('<span style="color: black;font-size: 20px;">SD XC</span>'),
      id = "tabs",

      tabPanel(
        title = HTML('<span style="color: black;font-size: 18px;">Rankings</span>'),

        # Sidebar with a slider input for number of bins
        sidebarLayout(
          sidebarPanel(
            fluidRow(
              column(
                width = 12,
                img(
                    src = "www/sdxc_logo11c.png",
                    width = "170",
                    height = "100"
                  ),
                align = "center"
              )
            ),
          
          hr(class = "custom-hr"),
            fluidRow(
              column(
                width = 4,
                radioButtons("toggle_class", "Select Class",
                  choices = list(
                    "Class B" = "classb",
                    "Class A" = "classa",
                    "Class AA" = "classaa",
                    "All Classes" = "classall")
                    )
              ),
              column(
                width = 4,
                radioButtons("toggle_gender", "Select Gender",
                  choices = list(
                    "Male" = "M",
                    "Female" = "F")
                    )
              ),
              column(
                width = 4,
                radioButtons("toggle_week", "Select Week",
                  choices = list(
                    "Week 1" = 1,
                    "Week 2" = 2)
                    )
              )
            ),
            hr(class = "custom-hr")

          ),

      ###############################################################################
      # Main
      ###############################################################################

          mainPanel(
            shinyjs::useShinyjs(),
            hr(class = "custom-hr-thick"),

            # br(),

              div(
                id = "first_file",
                # hr(class = "custom-hr"),
                h4("Selected Dataset"),
                textOutput("data_size"),
                # tags$head(
                #   tags$style(HTML("
                #     .dataTables_wrapper {background-color: #f8fcf8;border-color: #000000;padding: 10px;border-radius: 5px;}
                #     .dataTables_wrapper table.dataTable tbody tr:nth-child(odd) {background-color: #f3faf3;}
                #     .dataTables_wrapper table.dataTable tbody tr:nth-child(even) {background-color: #fff;}
                #   "))
                # ),
                DT::dataTableOutput("data_table_DT")
              )
            

          ) #mainPanel
        ) #sideBarpanel
      ), #tabPanel

    ), #navbarPage

    tags$head(includeHTML(app_sys("app", "www", "ga.html")))
  )
}

#' Add external Resources to the Application
#'
#' This function is internally used to add external
#' resources inside the Shiny application.
#'
#' @import shiny
#' @importFrom golem add_resource_path activate_js favicon bundle_resources
#' @noRd
golem_add_external_resources <- function() {
  add_resource_path(
    "www", app_sys("app/www")
  )

  tags$head(
    favicon(
      ico = "icon",
      rel = "shortcut icon",
      resources_path = "www",
      ext = "png"
    ),
    bundle_resources(
      path = app_sys("app/www"),
      app_title = "sdxc 0.01"
    )
    # Add here other external resources
    # for example, you can add shinyalert::useShinyalert()
  )
}
